import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { add } from 'date-fns';
import { BanUserForBlogUpdateModel, CreateUserInputModelType } from './UserDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { EmailService } from '../../helper/email.service';

@Injectable()
export class UsersService {
    constructor(protected usersRepository: UsersRepository, protected jwtService: JwtService, protected emailService: EmailService) {}

    async getUsers(queryData) {
        return await this.usersRepository.getUsers(queryData);
    }

    async getUserById(userId) {
        const user = await this.usersRepository.getUserById(userId);
        if (!user) throw new NotFoundException();
        return user;
    }

    async getUserByIdAc(userId) {
        const user = await this.usersRepository.getUserById(userId);
        if (!user) throw new UnauthorizedException();
        return user;
    }

    async getUserByLoginOrEmail(loginOrEmail: string) {
        const user = await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user || user.accountData.banInfo.isBanned === true) throw new UnauthorizedException();
        return user;
    }

    async getUserIdByAccessToken(token: string) {
        try {
            const result: any = this.jwtService.verify(token, { secret: 'SecretKey' });
            return result.userId;
        } catch (error) {
            return null;
        }
    }

    async createUser(inputModel: CreateUserInputModelType) {
        const passwordHash = await this._generateHash(inputModel.password);
        const newUser = {
            accountData: {
                id: new Date().valueOf().toString(),
                login: inputModel.login,
                email: inputModel.email,
                password: passwordHash,
                createdAt: new Date().toISOString(),
                banInfo: {
                    isBanned: false,
                    banReason: null,
                    banDate: null,
                },
            },
            emailConfirmation: {
                confirmationCode: randomUUID(),
                recoveryCode: randomUUID(),
                expirationDate: add(new Date(), { hours: 1 }),
                isConfirmed: false,
            },
        };
        const result = await this.usersRepository.createUser({ ...newUser });
        await this.emailService.sendEmail(newUser.accountData.email, 'Registr', newUser.emailConfirmation.confirmationCode);
        if (!result)
            throw new BadRequestException({
                message: 'Bad',
                field: 'login or Password',
            });
        return {
            id: result.accountData.id,
            login: result.accountData.login,
            email: result.accountData.email,
            createdAt: result.accountData.createdAt,
            banInfo: { isBanned: result.accountData.banInfo.isBanned, banReason: result.accountData.banInfo.banReason, banDate: null },
        };
    }

    async deleteUserById(userId: string) {
        return this.usersRepository.deleteUserById(userId);
    }

    async banUser(userId: number, isBanned: boolean, banReason: string) {
        const banDate = new Date().toISOString();
        return this.usersRepository.banUser(userId, isBanned, banReason, banDate);
    }

    _generateHash(password: string) {
        return bcrypt.hash(password, 10);
    }
}
