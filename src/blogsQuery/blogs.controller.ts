import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogQueryDto } from './BlogDto';
import { PostsService } from '../blogger/post/posts.service';
import { PostQueryDto } from '../postsQuery/PostDto';
import { Request } from 'express';
import { UsersService } from '../superAdmin/users/users.service';

@Controller('blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService, protected postsService: PostsService, protected usersService: UsersService) {}

    @Get() getBlogs(@Query() queryData: BlogQueryDto) {
        return this.blogsService.getBlogs(queryData);
    }

    @Get(':blogId') getBlogById(@Param('blogId') blogId) {
        return this.blogsService.getBlogById(blogId);
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
}
