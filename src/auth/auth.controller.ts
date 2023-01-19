import { Body, Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserInputModelType } from '../users/UserDto';
import { UsersService } from '../users/users.service';
import { EmailInputModelType, LoginInputModelType, PasswordInputModelType } from './LoginDto';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AccessTokenGuard, RefreshTokenGuard } from '../guard/authMeGuard';
import { User } from '../schemas/usersSchema';
import { UserDecorator } from '../decorators/user-param.decorator';

@Controller('auth')
export class AuthController {
    constructor(protected authService: AuthService, protected usersService: UsersService) {}

    @Get('me')
    @HttpCode(200)
    @UseGuards(AccessTokenGuard)
    async authMe(@UserDecorator() user: User) {
        return { email: user.accountData.email, userId: user.accountData.id, login: user.accountData.login };
    }

    @Post('registration')
    @HttpCode(204)
    async register(@Body() inputModel: CreateUserInputModelType) {
        return this.usersService.createUser(inputModel);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Res({ passthrough: true }) response: Response, @Req() request: Request, @Body() inputModel: LoginInputModelType) {
        const user = await this.usersService.getUserByLoginOrEmail(inputModel.loginOrEmail);

        if (!(await bcrypt.compare(inputModel.password, user.accountData.password))) {
            throw new UnauthorizedException();
        }

        const deviceId = randomUUID();

        const accessToken = await this.authService.createAccessToken(user.accountData.id, deviceId);
        const refreshToken = await this.authService.createRefreshToken(user.accountData.id, deviceId);
        const time = await this.authService.getIatAndExpToken(refreshToken);
        await this.authService.addDevice(user.accountData.id, request.headers['user-agent'], request.ip, deviceId, time.iat, time.exp);
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return { accessToken: accessToken };
    }

    @Post('refresh-token')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(200)
    async getRefreshToken(@Res({ passthrough: true }) response: Response, @Req() request: Request, @UserDecorator() user: User) {
        const refreshToken = request.cookies.refreshToken;
        const payload = await this.authService.getPayload(refreshToken);
        const checkRefreshToken = await this.authService.checkRefreshToken(payload.userId, payload.iat, payload.exp, payload.deviceId);
        if (checkRefreshToken) {
            const newRefreshToken = await this.authService.createRefreshToken(user.accountData.id, payload.deviceId);
            const newAccessToken = await this.authService.createAccessToken(user.accountData.id, payload.deviceId);
            response
                .cookie('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                })
                .send({ accessToken: newAccessToken })
                .status(200);
            const secondPayload = await this.authService.getPayload(newRefreshToken);
            await this.authService.updateDeviceRefreshToken(user.accountData.id, secondPayload.iat, secondPayload.exp, secondPayload.deviceId, payload.iat);
            return;
        }
        throw new UnauthorizedException();
    }

    @Post('logout')
    @UseGuards(RefreshTokenGuard)
    @HttpCode(204)
    async logout(@Req() request: Request, @UserDecorator() user: User) {
        const userId = user.accountData.id;
        const refreshToken = request.cookies.refreshToken;
        return this.authService.logout(userId, refreshToken);
    }

    @Post('registration-email-resending')
    @HttpCode(204)
    async registrationEmailResending(@Body() email: EmailInputModelType) {
        const resendingEmail = await this.authService.resentEmail(email.email);
        return resendingEmail;
    }

    @Post('new-password')
    @HttpCode(204)
    async newPassword(@Body() newPassword: PasswordInputModelType, @Body('recoveryCode') recoveryCode: string) {
        return await this.authService.passwordRecoveryConfirm(recoveryCode, newPassword.newPassword);
    }

    @Post('registration-confirmation')
    @HttpCode(204)
    async registrationConfirmation(@Body('code') code: string) {
        return await this.authService.registrationConfirm(code);
    }

    @Post('password-recovery')
    @HttpCode(204)
    async passwordRecovery(@Body() email: EmailInputModelType) {
        return await this.authService.passwordRecovery(email.email);
    }
}