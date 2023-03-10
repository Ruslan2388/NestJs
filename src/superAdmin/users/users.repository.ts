import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/usersSchema';
import { Model } from 'mongoose';
import { UserDecorator } from '../../decorators/user-param.decorator';
import { UserResponseType } from '../../helper/pagination';
import { BanUserForBlogUpdateModel } from './UserDto';
import { Blog, BlogDocument } from '../../schemas/blogsSchema';

@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

    async getUsers(queryData): Promise<User[] | any> {
        let banQuery;
        switch (queryData.banStatus) {
            case 'banned':
                banQuery = true;
                break;
            case 'notBanned':
                banQuery = false;
                break;
            default:
                banQuery = Boolean;
        }
        const filter = await this._getUsersFilterForQuery(queryData, banQuery);

        const totalCount = await this.userModel.countDocuments(filter);
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const result = await this.userModel
            .find(filter, { _id: 0, __v: 0, emailConfirmation: 0, 'accountData.blogBanInfo': 0 })
            .sort({ [`accountData.${queryData.sortBy}`]: queryData.sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const items = this._mapUserDbToResponse(result);

        return { pagesCount, page, pageSize, totalCount, items };
    }

    async getUserById(userId): Promise<User | null> {
        return this.userModel.findOne({ 'accountData.id': userId }, { _id: 0, __v: 0, password: 0, 'accountData.blogBanInfo': 0 });
    }

    async getUserByLoginOrEmail(loginOrEmail: string) {
        return this.userModel.findOne(
            {
                $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
            },
            { _id: 0, __v: 0, password: 0 },
        );
    }

    async getUserByConfirmationCode(code: string) {
        return this.userModel.findOne({ 'emailConfirmation.confirmationCode': code }, { _id: 0, __v: 0, password: 0 });
    }

    async getBannedUsersForBlog(queryData, blogId: string) {
        const bannedUserId: any = await this.blogModel.distinct('bannedUsers', { id: blogId });
        const filter = await this._getUsersFilterForQueryBanUser(queryData, bannedUserId);
        const totalCount = await this.userModel.countDocuments(filter);
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const result = await this.userModel
            .find(filter, { _id: 0, __v: 0, emailConfirmation: 0, email: 0 })
            .sort({ [`accountData.${queryData.sortBy}`]: queryData.sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        const items = this._mapUserBanDbToResponse(result);
        return { pagesCount, page, pageSize, totalCount, items };
    }

    async createUser(newUser): Promise<User | null> {
        try {
            return this.userModel.create(newUser);
        } catch (e) {
            return null;
        }
    }

    async deleteUserById(userId: string): Promise<number> {
        const result = await this.userModel.deleteOne({ 'accountData.id': userId });
        return result.deletedCount;
    }

    async deleteAllUsers() {
        return this.userModel.deleteMany({});
    }

    //$2b$10$7jFxWmI4P0MAFlWM83sFH.VdzaN4YBL2.kmStL2XBz.pbkenRUtTC
    async updateUserConfirmationCodeByEmail(email: string, newConfirmationCode: string) {
        const result = await this.userModel.updateOne({ 'accountData.email': email }, { $set: { 'emailConfirmation.confirmationCode': newConfirmationCode } });
        return result.matchedCount === 1;
    }

    async updatePasswordRecoveryCode(recoveryCode: string, newHashPassword: string) {
        const result = await this.userModel.updateOne({ 'emailConfirmation.recoveryCode': recoveryCode }, { $set: { 'accountData.password': newHashPassword } });
        return result.matchedCount === 1;
    }

    async updateCheckConfirmCode(code: string) {
        const result = await this.userModel.updateOne({ 'emailConfirmation.confirmationCode': code }, { $set: { 'emailConfirmation.isConfirmed': true } });
        return result.matchedCount === 1;
    }

    async updateUserRecoveryPasswordCodeByEmail(email: string, NewRecoveryCode: string) {
        const result = await this.userModel.updateOne({ 'accountData.email': email }, { $set: { 'emailConfirmation.recoveryCode': NewRecoveryCode } });
        return result.matchedCount === 1;
    }

    async banUser(userId: number, isBanned: boolean, banReason: string, banDate: string) {
        if (isBanned === true)
            return this.userModel.updateOne(
                { 'accountData.id': userId.toString() },
                { 'accountData.banInfo.isBanned': isBanned, 'accountData.banInfo.banReason': banReason, 'accountData.banInfo.banDate': banDate },
            );
        else
            return this.userModel.updateOne(
                { 'accountData.id': userId.toString() },
                { 'accountData.banInfo.isBanned': isBanned, 'accountData.banInfo.banReason': null, 'accountData.banInfo.banDate': null },
            );
    }

    async _getUsersFilterForQuery(queryData, banQuery: string) {
        if (!queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {
                'accountData.login': { $regex: queryData.searchLoginTerm, $options: 'i' },
                'accountData.banInfo.isBanned': banQuery,
            };
        }
        if (queryData.searchEmailTerm && !queryData.searchLoginTerm) {
            return {
                'accountData.email': { $regex: queryData.searchEmailTerm, $options: 'i' },
                'accountData.banInfo.isBanned': banQuery,
            };
        }
        if (queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {
                $or: [
                    {
                        'accountData.login': {
                            $regex: queryData.searchLoginTerm,
                            $options: 'i',
                        },
                    },
                    {
                        'accountData.email': {
                            $regex: queryData.searchEmailTerm,
                            $options: 'i',
                        },
                    },
                ],
                'accountData.banInfo.isBanned': banQuery,
            };
        }
        return { 'accountData.banInfo.isBanned': banQuery };
    }

    _mapUserDbToResponse(@UserDecorator() users: User[]): UserResponseType[] {
        return users.map((u) => ({
            id: u.accountData.id,
            login: u.accountData.login,
            email: u.accountData.email,
            createdAt: u.accountData.createdAt,
            banInfo: { isBanned: u.accountData.banInfo.isBanned, banReason: u.accountData.banInfo.banReason, banDate: u.accountData.banInfo.banDate },
        }));
    }
    _mapUserBanDbToResponse(@UserDecorator() users: User[]) {
        return users.map((u) => ({
            id: u.accountData.id,
            login: u.accountData.login,
            banInfo: { isBanned: u.accountData.blogBanInfo.isBanned, banReason: u.accountData.blogBanInfo.banReason, banDate: u.accountData.blogBanInfo.banDate },
        }));
    }
    private async _getUsersFilterForQueryBanUser(queryData, bannedUserId) {
        if (!queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {
                'accountData.login': { $regex: queryData.searchLoginTerm, $options: 'i' },
                'accountData.id': { $in: bannedUserId },
            };
        }
        if (queryData.searchEmailTerm && !queryData.searchLoginTerm) {
            return {
                'accountData.email': { $regex: queryData.searchEmailTerm, $options: 'i' },
                'accountData.id': { $in: bannedUserId },
            };
        }
        if (queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {
                $or: [
                    {
                        'accountData.login': {
                            $regex: queryData.searchLoginTerm,
                            $options: 'i',
                        },
                    },
                    {
                        'accountData.email': {
                            $regex: queryData.searchEmailTerm,
                            $options: 'i',
                        },
                    },
                ],
                'accountData.id': { $in: bannedUserId },
            };
        }
        return { 'accountData.id': { $in: bannedUserId } };
    }
}
