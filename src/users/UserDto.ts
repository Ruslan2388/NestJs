import { IsEmail, IsString, Length } from 'class-validator';
import { IsEmailInDb, IsLoginInDb } from '../decorators/registerDecorator';

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

export type UsersPaginationQueryType = {
    searchLoginTerm: string;
    searchEmailTerm: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
};
