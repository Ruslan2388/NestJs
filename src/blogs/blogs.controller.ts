import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogQueryDto, CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { PostsService } from '../posts/posts.service';
import { CreatePostByBlogIdInputModelType, PostQueryDto } from '../posts/PostDto';
import { BasicAuthGuard } from '../guard/basicAuthGuard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Controller('blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService, protected postsService: PostsService, protected usersService: UsersService) {}

    @Get() getBlogs(@Query() queryData: BlogQueryDto) {
        // console.log('f', bqDto);
        // const queryData = BlogPaginationData(blogQueryPagination);
        // console.log(queryData);
        return this.blogsService.getBlogs(queryData);
    }

    @Get(':blogId') getBlogById(@Param('blogId') blogId) {
        return this.blogsService.getBlogById(blogId);
    }

    @Post()
    @UseGuards(BasicAuthGuard)
    createBlog(@Body() inputModel: CreateBlogInputModelType) {
        return this.blogsService.createBlog(inputModel);
    }

    @Put(':blogId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    updateBlogByBlogId(@Param('blogId') blogId, @Body() updateModel: UpdateBlogInputModelType) {
        return this.blogsService.updateBlogByBlogId(blogId, updateModel);
    }

    @Delete(':blogId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async deleteBlogByBlogId(@Param('blogId') blogId: string) {
        const result = await this.blogsService.deleteBlogByBlogId(blogId);
        if (!result) {
            throw new NotFoundException();
        }
        return;
    }

    @Get(':blogId/posts')
    async getPostsByBlogId(@Param('blogId') blogId: string, @Query() queryData: PostQueryDto, @Req() request: Request) {
        let authUserId = '';
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);
            if (userId) {
                const user = await this.usersService.getUserById(userId);
                authUserId = user.accountData.id;
                return await this.postsService.getPostsByBlogId(queryData, blogId, authUserId);
            }
        }
        return await this.postsService.getPostsByBlogId(queryData, blogId, authUserId);
    }

    @Post(':blogId/posts')
    @UseGuards(BasicAuthGuard)
    async createPostsByBlogId(@Body() inputModel: CreatePostByBlogIdInputModelType, @Param('blogId') blogId: string) {
        const result = await this.postsService.createPostsByBlogId(inputModel, blogId);
        return result;
    }
}
