import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsLoginInDB implements ValidatorConstraintInterface {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    async validate(login: string) {
        try {
            const user = await this.userModel.findOne({
                'accountData.login': login,
            });

            if (user) return false;
            return true;
        } catch (e) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'This login already in db';
    }
}

@Injectable()
@ValidatorConstraint({ async: true })
export class IsEmailInInDB implements ValidatorConstraintInterface {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    async validate(email: string) {
        try {
            const user = await this.userModel.findOne({
                'accountData.email': email,
            });
            if (user) return false;
            return true;
        } catch (e) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'This email already in db';
    }
}
