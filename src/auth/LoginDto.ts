import { IsEmail, Length } from 'class-validator';
import { ResendEmailValidatorD } from '../decorators/resendEmail.decorator';

export class LoginInputModelType {
    @Length(3, 10)
    loginOrEmail: string;
    @Length(6, 20)
    password: string;
}

export class EmailInputModelType {
    @ResendEmailValidatorD()
    @IsEmail({}, { message: 'Incorrect Email' })
    @Length(1, 40)
    email: string;
}

export class PasswordInputModelType {
    @Length(6, 20)
    newPassword: string;
}
