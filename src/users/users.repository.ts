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
    async getUsers(term: string): Promise<User[]> {
        const users = this.userModel
            .find({}, { _id: 0, __v: 0, password: 0 })
            .exec();
        return users;
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

    async deleteUserById(userId: string): Promise<boolean> {
        const result = await this.userModel.deleteOne({ id: userId });
        return result.acknowledged;
    }
    async deleteAllUsers() {
        return this.userModel.deleteMany({});
    }
}
