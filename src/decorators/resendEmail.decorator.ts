import { registerDecorator, ValidationOptions } from 'class-validator';
import { ResendEmailValidator } from '../validator/resendEmailValidator';

export function ResendEmailValidatorD(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: ResendEmailValidator,
        });
    };
}
