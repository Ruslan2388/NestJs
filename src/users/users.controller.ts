import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserInputModelType } from '../type/users.type';

@Controller('users')
export class UsersController {
    constructor(protected usersService: UsersService) {}

    @Get()
    getUsers(@Query('term') term: string) {
        return this.usersService.getUsers(term);
    }

    @Get(':userId')
    getUser(@Param('userId') userId) {
        return this.usersService.getUserById(userId);
    }

    @Post()
    createUsers(@Body() inputModel: CreateUserInputModelType) {
        return this.usersService.createUser(inputModel);
    }

    @Delete(':userId')
    @HttpCode(204)
    async deleteUsers(@Param('userId') userId: string) {
        const result = await this.usersService.deleteUser(userId);
        if (!result) {
            throw new NotFoundException();
            throw new ForbiddenException();
        }
        return;
    }
}
