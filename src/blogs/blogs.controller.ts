import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogPaginationQueryType, CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { PostsService } from '../posts/posts.service';
import { CreatePostByBlogIdInputModelType, CreatePostInputModelType, PostPaginationQueryType } from '../posts/PostDto';
import { BlogPaginationData, getPostPaginationData } from '../helper/pagination';
import { BasicAuthGuard } from '../guard/basicAuthGuard';

@Controller('blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService, protected postsService: PostsService) {}

    @Get() getBlogs(@Query() blogQueryPagination: BlogPaginationQueryType) {
        const queryData = BlogPaginationData(blogQueryPagination);
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
    async getPostsByBlogId(@Param('blogId') blogId: string, @Query() postQueryPagination: PostPaginationQueryType) {
        const queryData = getPostPaginationData(postQueryPagination);
        const result = await this.postsService.getPostsByBlogId(queryData, blogId);
        return result;
    }

    @Post(':blogId/posts')
    @UseGuards(BasicAuthGuard)
    async createPostsByBlogId(@Body() inputModel: CreatePostByBlogIdInputModelType, @Param('blogId') blogId: string) {
        const result = await this.postsService.createPostsByBlogId(inputModel, blogId);
        return result;
    }
}
