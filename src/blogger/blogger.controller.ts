import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BloggerService } from './blogger.service';
import { BlogQueryDto, CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { PostsService } from '../posts/posts.service';
import { CreatePostByBlogIdInputModelType } from '../posts/PostDto';
import { UsersService } from '../superAdmin/users/users.service';
import { AccessTokenGuard } from '../guard/authMeGuard';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';

@Controller('blogger')
export class BloggerController {
    constructor(protected bloggerService: BloggerService, protected postsService: PostsService, protected usersService: UsersService) {}

    @UseGuards(AccessTokenGuard)
    @Get('blogger')
    getBlogs(@Query() queryData: BlogQueryDto, @UserDecorator() user: User) {
        return this.bloggerService.getBlogger(queryData, user);
    }

    @Get('blogger/:blogId') getBlogById(@Param('blogId') blogId) {
        return this.bloggerService.getBlogById(blogId);
    }

    @Post('blogger')
    @UseGuards(AccessTokenGuard)
    createBlog(@Body() inputModel: CreateBlogInputModelType, @UserDecorator() user: User) {
        return this.bloggerService.createBlog(inputModel, user);
    }

    @Put('blogger/:blogId')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async updateBlogByBlogId(@Param('blogId') blogId, @Body() updateModel: UpdateBlogInputModelType, @UserDecorator() user: User) {
        const blog = await this.bloggerService.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userLogin !== user.accountData.login) throw new ForbiddenException();
        return await this.bloggerService.updateBlogByBlogId(blogId, updateModel);
    }

    @Delete('blogger/:blogId')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async deleteBlogByBlogId(@Param('blogId') blogId: string, @UserDecorator() user: User) {
        const blog = await this.bloggerService.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userLogin !== user.accountData.login) throw new ForbiddenException();
        const result = await this.bloggerService.deleteBlogByBlogId(blogId);
        if (!result) {
            throw new NotFoundException();
        }
        return;
    }

    @Post('blogger/:blogId/posts')
    @UseGuards(AccessTokenGuard)
    async createPostsByBlogId(@Body() inputModel: CreatePostByBlogIdInputModelType, @Param('blogId') blogId: string, @UserDecorator() user: User) {
        const blog = await this.bloggerService.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userLogin !== user.accountData.login) throw new ForbiddenException();
        return await this.postsService.createPostsByBlogId(inputModel, blogId);
    }
}