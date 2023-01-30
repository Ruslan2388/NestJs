import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from '../schemas/deviceSchema';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesRepository {
    constructor(@InjectModel(Device.name) private deviceModel: Model<DeviceDocument>) {}

    async addDevice(newDevice: { ip: string; lastActiveDate: string; title: string; exp: string; userId: string; deviceId: string }) {
        return await this.deviceModel.create(newDevice);
    }

    async getActiveDevice(userId: string) {
        return this.deviceModel.find(
            { userId: userId },
            {
                projection: {
                    _id: 0,
                    exp: 0,
                    refreshTokenActive: 0,
                    userId: 0,
                },
            },
        );
    }
    async getDeviceById(deviceId: string) {
        return this.deviceModel.findOne(
            { deviceId },
            {
                projection: {
                    _id: 0,
                    exp: 0,
                    refreshTokenActive: 0,
                },
            },
        );
    }
    async updateRefreshTokenActive(userId: string, userAgent: string, iat: Date, exp: Date, deviceId: string) {
        return this.deviceModel.updateOne(
            {
                userId,
                title: userAgent,
            },
            {
                $set: {
                    lastActiveDate: iat.toISOString(),
                    exp: exp.toISOString(),
                    deviceId: deviceId,
                },
            },
        );
    }

    async updateRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string, searchIat: Date) {
        const result = await this.deviceModel.updateOne(
            {
                userId: userId,
                lastActiveDate: searchIat.toISOString(),
                deviceId: deviceId,
            },
            { $set: { lastActiveDate: iat.toISOString(), exp: exp.toISOString() } },
        );
        return result.matchedCount === 1;
    }

    async checkDeviceByRepeat(userId: string, userAgent: string) {
        return this.deviceModel.findOne({
            userId: userId,
            title: userAgent,
        });
    }

    async DeleteDeviceByUserId(userId: string, iat: Date) {
        const result = await this.deviceModel.deleteOne({
            userId: userId,
            lastActiveDate: iat.toISOString(),
        });
        return result.deletedCount === 1;
    }

    async deleteAllUnDevices(userId: string, deviceId: string) {
        const findDevice = await this.deviceModel.find({ userId }).lean();
        if (findDevice.length === 1) return true;
        const result = await this.deviceModel.deleteMany({ userId: userId, deviceId: { $ne: deviceId } });
        if (result) {
            return true;
        }
        return false;
    }

    async deleteDeviceById(userId: string, deviceId: string) {
        const result = await this.deviceModel.deleteOne({ userId: userId, deviceId: deviceId });
        return result.deletedCount === 1;
    }
}
