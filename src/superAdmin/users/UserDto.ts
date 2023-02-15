import { IsBoolean, IsEmail, isEnum, IsOptional, IsString, Length } from 'class-validator';
import { IsEmailInDb, IsLoginInDb } from '../../decorators/registerDecorator';
import { Transform } from 'class-transformer';

export class CreateUserInputModelType {
    @IsLoginInDb()
    @Length(3, 10)
    @IsString()
    login: string;

    @Length(6, 20)
    @IsString()
    password: string;

    @IsEmailInDb()
    @IsEmail({}, { message: 'Incorrect Email' })
    @Length(1, 40)
    email: string;
}

export class BanUserUpdateModel {
    @IsBoolean()
    isBanned: boolean;

    @Length(20, 40)
    @IsString()
    banReason: string;
}

export class UserQueryDto {
    @IsOptional()
    public searchLoginTerm = '';

    @IsOptional()
    public searchEmailTerm = '';

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    public pageNumber = 1;

    @Transform(({ value }) => parseInt(value))
    @IsOptional()
    public pageSize = 10;

    @IsOptional()
    public sortBy = 'createdAt';

    @IsOptional()
    public sortDirection = 'desc';
}
