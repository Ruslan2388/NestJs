import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';
import { CreateUserInputModelType } from '../type/users.type';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}
    async getUsers(queryData): Promise<User[] | any> {
        const totalCount = await this.userModel.countDocuments({});
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(
            Math.ceil(Number(totalCount) / queryData.pageSize),
        );
        const pageSize = Number(queryData.pageSize);
        const items = await this.userModel
            .find({}, { _id: 0, __v: 0, password: 0 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .sort([[queryData.sortBy, queryData.sortDirection]]);
        console.log('ssssssss');
        console.log(queryData);
        console.log(page);
        return { pagesCount, page, pageSize, totalCount, items };
    }
    async getUserById(userId): Promise<User> | null {
        return this.userModel.findOne(
            { id: userId },
            { _id: 0, __v: 0, password: 0 },
        );
    }
    async createUser(newUser: CreateUserInputModelType): Promise<User | null> {
        try {
            return this.userModel.create(newUser);
        } catch (e) {
            return null;
        }
    }

    async deleteUserById(userId: string): Promise<number> {
        const result = await this.userModel.deleteOne({ id: userId });
        return result.deletedCount;
    }
    async deleteAllUsers() {
        return this.userModel.deleteMany({});
    }
}
