import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserInputModelType } from '../type/users.type';

@Injectable()
export class UsersService {
    constructor(protected usersRepository: UsersRepository) {}

    getUsers(term: string) {
        return this.usersRepository.getUsers(term);
    }
    async getUserById(userId) {
        return this.usersRepository.getUserById(userId);
    }
    async createUser(inputModel: CreateUserInputModelType) {
        const newUser = {
            id: new Date().valueOf().toString(),
            login: inputModel.login,
            email: inputModel.email,
            password: inputModel.password,
            createdAt: new Date().toISOString(),
        };
        const result = await this.usersRepository.createUser({ ...newUser });
        if (!result) throw new BadRequestException();
        return {
            id: result.id,
            login: result.login,
            email: result.email,
            createdAt: result.createdAt,
        };
    }

    async deleteUserById(userId: string) {
        return this.usersRepository.deleteUserById(userId);
    }
}
