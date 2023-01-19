import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersRepository } from '../users/users.repository';
import { EmailService } from '../helper/email.service';

@Injectable()
export class AuthService {
    constructor(protected authRepository: AuthRepository, private jwtService: JwtService, protected usersRepository: UsersRepository, protected emailAdapter: EmailService) {}

    async createAccessToken(userId: string, deviceId: string) {
        return this.jwtService.sign({ userId: userId, deviceId: deviceId }, { secret: 'SecretKey', expiresIn: '1min' });
    }

    async createRefreshToken(userId: string, deviceId: string) {
        return this.jwtService.sign({ userId: userId, deviceId: deviceId }, { secret: 'SecretKey', expiresIn: '2m' });
    }

    async addDevice(userId: string, userAgent: string, ip: string, deviceId: string, iat: Date, exp: Date) {
        const checkDevice = await this.authRepository.checkDeviceByRepeat(userId, userAgent);
        if (checkDevice) {
            return await this.authRepository.updateRefreshTokenActive(userId, userAgent, iat, exp, deviceId);
        }
        const newDevice = {
            userId: userId,
            title: userAgent,
            lastActiveDate: iat.toISOString(),
            exp: exp.toISOString(),
            ip: ip,
            deviceId: deviceId,
        };
        return await this.authRepository.addDevice(newDevice);
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

    async updateDeviceRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string, searchIat: Date) {
        return this.authRepository.updateRefreshToken(userId, iat, exp, deviceId, searchIat);
    }

    async logout(userId: string, refreshToken: any) {
        const payload = await this.getPayload(refreshToken);
        return await this.authRepository.DeleteDeviceByUserId(userId, payload.iat);
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
                    field: 'Email',
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
        const updateIsConfirmed = await this.usersRepository.updateCheckConfirmCode(code);
        if (updateIsConfirmed) {
            return true;
        }
        throw new BadRequestException([{ message: 'Incorrect confirmedCode', field: 'confirmedCode' }]);
    }

    async passwordRecovery(email: string) {
        const user = await this.usersRepository.getUserByLoginOrEmail(email);
        if (user?.emailConfirmation.isConfirmed === true) throw new BadRequestException([{ message: 'Email is confirm', field: 'email' }]);
        if (!user) return true;
        const NewRecoveryCode = randomUUID();
        await this.usersRepository.updateUserRecoveryPasswordCodeByEmail(email, NewRecoveryCode);
        await this.emailAdapter.sendMailRecoveryPassword(email, 'RecoveryPassword', NewRecoveryCode);
        return true;
    }
}
