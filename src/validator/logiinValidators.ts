import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUserBan implements ValidatorConstraintInterface {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    async validate(loginOrEmail: string) {
        try {
            const user = await this.userModel.findOne({
                $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
            });
            if (!user) return false;
            if (user.accountData.banInfo.isBanned === true) {
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'ХУЕТА';
    }
}
