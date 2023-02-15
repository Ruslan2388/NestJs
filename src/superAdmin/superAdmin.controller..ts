import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BlogsSAService } from './blogs/blogs-SA.service';
import { BlogQueryDto } from '../blogger/BlogDto';
import { BasicAuthGuard } from '../guard/basicAuthGuard';
import { BlogsService } from '../blogsQuery/blogs.service';
import { UsersService } from './users/users.service';
import { BanUserUpdateModel, CreateUserInputModelType, UserQueryDto } from './users/UserDto';

@Controller('sa')
export class SuperAdminController {
    constructor(protected blogsSAService: BlogsSAService, protected blogService: BlogsService, protected usersService: UsersService) {}
    @UseGuards(BasicAuthGuard)
    @Get('blogger')
    async getBlogs(@Query() queryData: BlogQueryDto) {
        return this.blogsSAService.getBlogsSa(queryData);
    }

    @Get('users') async getUsers(@Query() queryData: UserQueryDto) {
        return await this.usersService.getUsers(queryData);
    }

    @Get('users/:userId') getUser(@Param('userId') userId) {
        return this.usersService.getUserById(userId);
    }

    @Post('users')
    @HttpCode(201)
    @UseGuards(BasicAuthGuard)
    createUsers(@Body() inputModel: CreateUserInputModelType) {
        return this.usersService.createUser(inputModel);
    }

    @UseGuards(BasicAuthGuard)
    @HttpCode(204)
    @Put('blogger/:blogId/bind-with-user/:userId')
    async bindBlogWithUser(@Param('blogId') blogId, @Param('userId') userId) {
        const blog = await this.blogService.getBlogById(blogId);
        if (typeof blog.blogOwnerInfo.userLogin === 'string')
            throw new BadRequestException({
                message: 'Its BLog Have User',
                field: 'BlogId || UserID',
            });
        const user = await this.usersService.getUserById(userId);
        return await this.blogsSAService.bindBlogWithUser(blog.id, user.accountData.id, user.accountData.login);
    }

    @Put('users/:userId/ban')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async banUser(@Param('userId') userId: number, @Body() updateModel: BanUserUpdateModel) {
        return this.usersService.banUser(userId, updateModel.isBanned, updateModel.banReason);
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
