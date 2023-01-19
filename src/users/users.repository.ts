import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';
import { UserDecorator } from '../decorators/user-param.decorator';
import { UserResponseType } from '../helper/pagination';

@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async getUsers(queryData): Promise<User[] | any> {
        const filter = await this._getUsersFilterForQuery(queryData);
        console.log(filter);
        const totalCount = await this.userModel.countDocuments(filter);
        console.log(totalCount);
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        console.log({ [queryData.sortBy]: queryData.sortDirection });
        const result = await this.userModel
            .find(filter, { _id: 0, __v: 0, emailConfirmation: 0 })
            .sort({ [`accountData.${queryData.sortBy}`]: queryData.sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const items = this._mapUserDbToResponse(result);

        return { pagesCount, page, pageSize, totalCount, items };
    }

    async getUserById(userId): Promise<User | null> {
        return this.userModel.findOne({ 'accountData.id': userId }, { _id: 0, __v: 0, password: 0 });
    }

    async getUserByLoginOrEmail(loginOrEmail: string) {
        return this.userModel.findOne(
            {
                $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
            },
            { _id: 0, __v: 0, password: 0 },
        );
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

    async _getUsersFilterForQuery(queryData) {
        if (!queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {
                'accountData.login': { $regex: queryData.searchLoginTerm, $options: 'i' },
            };
        }
        if (queryData.searchEmailTerm && !queryData.searchLoginTerm) {
            return {
                'emailConfirmation.email': { $regex: queryData.searchEmailTerm, $options: 'i' },
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
                        'emailConfirmation.email': {
                            $regex: queryData.searchEmailTerm,
                            $options: 'i',
                        },
                    },
                ],
            };
        }
        return {};
    }
    _mapUserDbToResponse(@UserDecorator() users: User[]): UserResponseType[] {
        return users.map((u) => ({
            id: u.accountData.id,
            login: u.accountData.login,
            email: u.accountData.email,
            createdAt: u.accountData.createdAt,
        }));
    }
}
