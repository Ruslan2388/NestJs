import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputModelType } from '../UserDto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../../../helper/email.service';
import { UsersRepository } from '../users.repository';

export class createUserCommand {
    constructor(public inputModel: CreateUserInputModelType) {}
}

@CommandHandler(createUserCommand)
export class createUserUseCase implements ICommandHandler<createUserCommand> {
    constructor(protected emailService: EmailService, protected usersRepository: UsersRepository) {}
    async execute(command: createUserCommand) {
        const passwordHash = await this._generateHash(command.inputModel.password);
        const newUser = {
            accountData: {
                id: new Date().valueOf().toString(),
                login: command.inputModel.login,
                email: command.inputModel.email,
                password: passwordHash,
                createdAt: new Date().toISOString(),
                banInfo: {
                    isBanned: false,
                    banReason: null,
                    banDate: null,
                },
                blogBanInfo: { isBanned: null, banReason: null, blogId: null, banDate: null },
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
    _generateHash(password: string) {
        return bcrypt.hash(password, 10);
    }
}
