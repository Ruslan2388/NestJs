import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/deviceSchema';

@Injectable()
export class AuthRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>) {}

    async addDevice(newDevice: { ip: string; lastActiveDate: string; title: string; exp: string; userId: string; deviceId: string }) {
        return await this.deviceModel.create(newDevice);
    }

    async deleteAllDevice() {
        return this.deviceModel.deleteMany({});
    }

    async checkRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string) {
        return this.deviceModel.findOne({ userId: userId, lastActiveDate: iat.toISOString(), deviceId: deviceId });
    }

    async checkDeviceByRepeat(userId: string, userAgent: string) {
        return this.deviceModel.findOne({
            userId: userId,
            title: userAgent,
        });
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

    async DeleteDeviceByUserId(userId: string, iat: Date) {
        const result = await this.deviceModel.deleteOne({
            userId: userId,
            lastActiveDate: iat.toISOString(),
        });
        return result.deletedCount === 1;
    }
}
