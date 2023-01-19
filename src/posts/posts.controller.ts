import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostInputModelType, PostPaginationQueryType, UpdatePostInputModelType } from './PostDto';
import { getPostPaginationData } from '../helper/pagination';
import { BasicAuthGuard } from '../guard/basicAuthGuard';

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

    @Post()
    @UseGuards(BasicAuthGuard)
    createPost(@Body() inputModel: CreatePostInputModelType) {
        return this.postsService.createPost(inputModel);
    }

    @Put(':postId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    updateBlogByBlogId(@Param('postId') postId, @Body() updateModel: UpdatePostInputModelType) {
        return this.postsService.updatePostByPostId(postId, updateModel);
    }

    @Delete(':postId')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async deletePostById(@Param('postId') postId) {
        const result = await this.postsService.deletePostById(postId);
        if (!result) {
            throw new NotFoundException();
        }
    }
}
