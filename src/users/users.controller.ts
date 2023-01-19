import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserInputModelType, UsersPaginationQueryType } from './UserDto';
import { UsersPaginationData } from '../helper/pagination';
import { BasicAuthGuard } from '../guard/basicAuthGuard';

@Controller('users')
export class UsersController {
    constructor(protected usersService: UsersService) {}

    @Get() async getUsers(@Query() usersQueryPagination: UsersPaginationQueryType) {
        const queryData = UsersPaginationData(usersQueryPagination);
        return await this.usersService.getUsers(queryData);
    }

    @Get(':userId') getUser(@Param('userId') userId) {
        return this.usersService.getUserById(userId);
    }

    @Post()
    @HttpCode(201)
    @UseGuards(BasicAuthGuard)
    createUsers(@Body() inputModel: CreateUserInputModelType) {
        return this.usersService.createUser(inputModel);
    }

    @Delete(':userId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async deleteUsers(@Param('userId') userId: string) {
        const result = await this.usersService.deleteUserById(userId);
        if (!result) {
            throw new NotFoundException();
        }
        return;
    }
}
