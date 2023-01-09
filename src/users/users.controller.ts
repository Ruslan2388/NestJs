import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
    CreateUserInputModelType,
    UsersPaginationQueryType,
} from '../type/users.type';
import { UsersPaginationData } from '../helper/pagination';

@Controller('users')
export class UsersController {
    constructor(protected usersService: UsersService) {}

    @Get() getUsers(@Query() usersQueryPagination: UsersPaginationQueryType) {
        const queryData = UsersPaginationData(usersQueryPagination);
        return this.usersService.getUsers(queryData);
    }

    @Get(':userId') getUser(@Param('userId') userId) {
        return this.usersService.getUserById(userId);
    }

    @Post() createUsers(@Body() inputModel: CreateUserInputModelType) {
        return this.usersService.createUser(inputModel);
    }

    @Delete(':userId')
    @HttpCode(204)
    async deleteUsers(@Param('userId') userId: string) {
        const result = await this.usersService.deleteUserById(userId);
        if (!result) {
            throw new NotFoundException();
        }
        return;
    }
}
