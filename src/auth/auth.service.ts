import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../superAdmin/users/users.repository';
import { EmailService } from '../helper/email.service';
import { DevicesRepository } from '../devices/devices.repository';

@Injectable()
export class AuthService {
    constructor(
        protected authRepository: AuthRepository,
        private jwtService: JwtService,
        protected usersRepository: UsersRepository,
        protected emailAdapter: EmailService,
        protected devicesRepository: DevicesRepository,
    ) {}

    async createAccessToken(userId: string, deviceId: string) {
        return this.jwtService.sign({ userId: userId, deviceId: deviceId }, { secret: 'SecretKey', expiresIn: '20m' });
    }

    async createRefreshToken(userId: string, deviceId: string) {
        return this.jwtService.sign({ userId: userId, deviceId: deviceId }, { secret: 'SecretKey', expiresIn: '50m' });
    }

    async getIatAndExpToken(refreshToken: string) {
        const payload: any = this.jwtService.decode(refreshToken);
        const iat = new Date(payload.iat * 1000);
        const exp = new Date(payload.exp * 1000);
        return { iat, exp };
    }

    async getPayload(refreshToken: string) {
        try {
            const payload = this.jwtService.verify<{ userId: string; deviceId: string; iat: number; exp: number }>(refreshToken, { secret: 'SecretKey' });
            const userId = payload.userId;
            const deviceId = payload.deviceId;
            const iat = new Date(payload.iat * 1000);
            const exp = new Date(payload.exp * 1000);
            return { deviceId, iat, exp, userId };
        } catch (error) {
            return null;
        }
    }

    async checkRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string) {
        const result = await this.authRepository.checkRefreshToken(userId, iat, exp, deviceId);
        if (result) {
            return true;
        }
        return false;
    }

    async logout(userId: string, refreshToken: any) {
        const payload = await this.getPayload(refreshToken);
        return await this.devicesRepository.DeleteDeviceByUserId(userId, payload.iat);
    }

    async resentEmail(email: string) {
        const newConfirmationCode = randomUUID();
        const updateUserConfirmCodeByEmail = await this.usersRepository.updateUserConfirmationCodeByEmail(email, newConfirmationCode);
        if (updateUserConfirmCodeByEmail) {
            const sendEmail = await this.emailAdapter.sendEmail(email, 'Resending', newConfirmationCode);
            return sendEmail;
        } else
            throw new BadRequestException([
                {
                    message: 'Incorrect Email',
                    field: 'email',
                },
            ]);
    }

    async passwordRecoveryConfirm(recoveryCode: string, newPassword: string) {
        const newHashPassword = await bcrypt.hash(newPassword, 10);
        const updateIsConfirmed = await this.usersRepository.updatePasswordRecoveryCode(recoveryCode, newHashPassword);
        if (updateIsConfirmed) {
            return true;
        }
        throw new BadRequestException([{ message: 'Incorrect recoveryCode', field: 'recoveryCode' }]);
    }

    async registrationConfirm(code: string) {
        const user = await this.usersRepository.getUserByConfirmationCode(code);
        if (user === null) throw new BadRequestException([{ message: 'Incorrect confirmationCode', field: 'code' }]);
        if (user?.emailConfirmation.confirmationCode !== code || user?.emailConfirmation.isConfirmed === true)
            throw new BadRequestException([{ message: 'Incorrect confirmationCode', field: 'code' }]);
        const updateIsConfirmed = await this.usersRepository.updateCheckConfirmCode(code);
        if (updateIsConfirmed) {
            return true;
        }
        throw new BadRequestException([{ message: 'Incorrect confirmedCode', field: 'code' }]);
    }

    async passwordRecovery(email: string) {
        const user = await this.usersRepository.getUserByLoginOrEmail(email);
        if (!user) throw new BadRequestException([{ message: 'Bad email', field: 'email' }]);
        const NewRecoveryCode = randomUUID();
        await this.usersRepository.updateUserRecoveryPasswordCodeByEmail(email, NewRecoveryCode);
        await this.emailAdapter.sendMailRecoveryPassword(email, 'RecoveryPassword', NewRecoveryCode);
        return true;
    }
}
