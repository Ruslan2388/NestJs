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
import { PostsService } from './posts.service';
import {
    CreatePostInputModelType,
    PostPaginationQueryType,
} from '../type/posts.type';
import { getPostPaginationData } from '../helper/pagination';

@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService) {}
    @Get() getPosts(@Query() postQueryPagination: PostPaginationQueryType) {
        const queryData = getPostPaginationData(postQueryPagination);
        return this.postsService.getPosts(queryData);
    }
    @Get(':postId') getPostById(@Param('postId') postId) {
        return this.postsService.getPostById(postId);
    }
    @Post() createPost(@Body() inputModel: CreatePostInputModelType) {
        return this.postsService.createPost(inputModel);
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
