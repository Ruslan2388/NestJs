import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../superAdmin/users/users.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(protected userService: UsersService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;
        if (!auth) throw new UnauthorizedException();
        const authType = auth.split(' ')[0];
        if (authType !== 'Bearer') {
            throw new UnauthorizedException();
        }
        const accessToken = request.headers.authorization.split(' ')[1];
        const userId = await this.userService.getUserIdByAccessToken(accessToken);
        if (!userId) throw new UnauthorizedException();
        const user = await this.userService.getUserByIdAc(userId);
        if (user.accountData.banInfo.isBanned) throw new UnauthorizedException();
        if (user) {
            request.user = user;
            return true;
        }
        throw new UnauthorizedException();
    }
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(protected userService: UsersService, protected authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { refreshToken } = request.cookies;
        if (!refreshToken) throw new UnauthorizedException();
        const payload = await this.authService.getPayload(refreshToken);
        if (!payload) throw new UnauthorizedException();
        const user = await this.userService.getUserById(payload.userId);
        if (!user) throw new UnauthorizedException();
        if (user) {
            request.user = user;
            return true;
        }
    }
}
