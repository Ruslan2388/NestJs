import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsUserBan } from '../validator/logiinValidators';

export function IsUserBanDecorator(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsUserBan,
        });
    };
}
