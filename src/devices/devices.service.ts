import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';

@Injectable()
export class DevicesService {
    constructor(protected deviceRepository: DevicesRepository) {}
    async getActiveDevice(userId: string) {
        return await this.deviceRepository.getActiveDevice(userId);
    }

    async addDevice(userId: string, userAgent: string, ip: string, deviceId: string, iat: Date, exp: Date) {
        const checkDevice = await this.deviceRepository.checkDeviceByRepeat(userId, userAgent);
        if (checkDevice) {
            return await this.deviceRepository.updateRefreshTokenActive(userId, userAgent, iat, exp, deviceId);
        }
        const newDevice = {
            userId: userId,
            title: userAgent,
            lastActiveDate: iat.toISOString(),
            exp: exp.toISOString(),
            ip: ip,
            deviceId: deviceId,
        };
        return await this.deviceRepository.addDevice(newDevice);
    }

    async updateDeviceRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string, searchIat: Date) {
        return this.deviceRepository.updateRefreshToken(userId, iat, exp, deviceId, searchIat);
    }

    async deleteALlDevices(userId: string, deviceId: string) {
        return this.deviceRepository.deleteAllUnDevices(userId, deviceId);
    }

    async getDeviceById(deviceId: string) {
        return this.deviceRepository.getDeviceById(deviceId);
    }

    async deleteDeviceById(userId: string, deviceId: string) {
        return await this.deviceRepository.deleteDeviceById(userId, deviceId);
    }
}
