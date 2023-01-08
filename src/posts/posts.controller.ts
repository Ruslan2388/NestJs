import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostInputModelType } from '../type/posts.type';

@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService) {}
    @Get() getPosts() {
        return this.postsService.getPosts();
    }
    @Get(':postId') getPostById(@Param('postId') postId) {
        return this.postsService;
    }
    @Post() createBlog(@Body() inputModel: CreatePostInputModelType) {
        return this.postsService;
    }
    @Delete(':postId')
    @HttpCode(204)
    async deletePostById(@Param('postId') postId) {
        const result = await this.postsService.deletePostById(postId);
        if (!result) {
            throw new NotFoundException();
        }
    }
}
