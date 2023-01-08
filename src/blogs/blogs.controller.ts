import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogInputModelType } from '../type/blogs.type';
import { PostsService } from '../posts/posts.service';
import { CreatePostInputModelType } from '../type/posts.type';

@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsService: BlogsService,
        protected postsService: PostsService,
    ) {}
    @Get() getBlogs() {
        return this.blogsService.getBlogs();
    }
    @Get(':blogId') getBlogById(@Param('blogId') blogId) {
        return this.blogsService.getBlogById(blogId);
    }
    @Post() createBlog(@Body() inputModel: CreateBlogInputModelType) {
        return this.blogsService.createBlog(inputModel);
    }
    @Put(':blogId') updateBlogByBlogId(
        @Param('blogId') blogId,
        @Body() updateModel: CreateBlogInputModelType,
    ) {
        return this.blogsService.updateBlogByBlogId(blogId, updateModel);
    }
    @Delete(':blogId')
    @HttpCode(204)
    async deleteBlogByBlogId(@Param('blogId') blogId: string) {
        const result = await this.blogsService.deleteBlogByBlogId(blogId);
        if (!result) {
            throw new NotFoundException();
        }
        return;
    }
    @Get(':blogId/posts')
    async getPostsByBlogId(@Param('blogId') blogId: string) {
        const result = await this.postsService.getPostsByBlogId(blogId);
        return result;
    }
    @Post('blogId/posts')
    async createPostsByBlogId(
        @Body() inputModel: CreatePostInputModelType,
        @Param('blogId') blogId: string,
    ) {
        const result = await this.postsService.createPostsByBlogId(
            inputModel,
            blogId,
        );
        return result;
    }
}
