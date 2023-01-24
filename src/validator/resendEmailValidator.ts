import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/usersSchema';

@Injectable()
@ValidatorConstraint({ async: true })
export class ResendEmailValidator implements ValidatorConstraintInterface {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    async validate(email: string) {
        try {
            const user = await this.userModel.findOne({
                'accountData.email': email,
            });
            return user.emailConfirmation.isConfirmed === false;
        } catch (e) {
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        return 'This email confirm';
    }
}
