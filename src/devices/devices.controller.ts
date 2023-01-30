import { DevicesService } from './devices.service';
import { Controller, Delete, Get, HttpCode, NotFoundException, Param, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';
import { RefreshTokenGuard } from '../guard/authMeGuard';
import { AuthService } from '../auth/auth.service';

@Controller('security')
export class DevicesController {
    constructor(protected deviceService: DevicesService, protected authService: AuthService) {}

    @UseGuards(RefreshTokenGuard)
    @HttpCode(200)
    @Get('devices')
    async getActiveDevices(@Req() request: Request, @UserDecorator() user: User) {
        return await this.deviceService.getActiveDevice(user.accountData.id);
    }
    @UseGuards(RefreshTokenGuard)
    @HttpCode(204)
    @Delete('devices')
    async deleteAllDevices(@Req() request: Request, @UserDecorator() user: User) {
        const refreshToken = request.cookies.refreshToken;
        const payload = await this.authService.getPayload(refreshToken);
        if (!payload) throw new UnauthorizedException();
        return await this.deviceService.deleteALlDevices(user.accountData.id, payload.deviceId);
    }

    @UseGuards(RefreshTokenGuard)
    @HttpCode(204)
    @Delete('devices/:deviceId')
    async deleteDeviceById(@Param('deviceId') deviceId, @Req() request: Request) {
        const findDeviceById = await this.deviceService.getDeviceById(deviceId);
        if (!findDeviceById) throw new NotFoundException();
        const refreshToken = request.cookies.refreshToken;
        const payload = await this.authService.getPayload(refreshToken);
        if (findDeviceById.userId !== payload.userId) throw new UnauthorizedException();
        const deleteDeviceById = await this.deviceService.deleteDeviceById(payload.userId, findDeviceById.deviceId);
    }
}
