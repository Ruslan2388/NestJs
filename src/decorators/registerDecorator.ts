import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsEmailInInDB, IsLoginInDB } from '../validator/registerValidator';

export function IsLoginInDb(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isLoginDb',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsLoginInDB,
        });
    };
}
export function IsEmailInDb(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsEmailDb',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsEmailInInDB,
        });
    };
}
