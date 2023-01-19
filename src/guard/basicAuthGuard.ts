import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BasicAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const header = request.header('Authorization');
        const matchArr = header.match(/^Basic (.*)$/);
        const [login, passwd] = Buffer.from(matchArr[1], 'base64').toString().split(':');
        if (login === 'admin' && passwd === 'qwerty') {
            return true;
        } else {
            throw new UnauthorizedException();
        }
    }
}
