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
import { PostsService } from './posts.service';
import {
    CreatePostInputModelType,
    PostPaginationQueryType,
} from '../type/posts.type';
import { getPostPaginationData } from '../helper/pagination';
import { CreateBlogInputModelType } from '../type/blogs.type';

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

    @Put(':postId')
    @HttpCode(204)
    updateBlogByBlogId(
        @Param('postId') postId,
        @Body() updateModel: CreatePostInputModelType,
    ) {
        return this.postsService.updatePostByPostId(postId, updateModel);
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
