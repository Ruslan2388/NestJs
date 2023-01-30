import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/deviceSchema';

@Injectable()
export class AuthRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>) {}

    async deleteAllDevice() {
        return this.deviceModel.deleteMany({});
    }

    async checkRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string) {
        return this.deviceModel.findOne({ userId: userId, lastActiveDate: iat.toISOString(), deviceId: deviceId });
    }
}
