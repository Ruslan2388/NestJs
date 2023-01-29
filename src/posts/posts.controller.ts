import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostInputModelType, PostPaginationQueryType, UpdatePostInputModelType } from './PostDto';
import { getPostPaginationData } from '../helper/pagination';
import { BasicAuthGuard } from '../guard/basicAuthGuard';
import { AccessTokenGuard } from '../guard/authMeGuard';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';
import { CommentsPaginationData, CommentsPaginationQueryType, CreateCommentsInputModel, UpdateCommentsInputModel } from '../comments/CommentsDto';
import { CommentsService } from '../comments/comments.service';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { LikeInputModel } from '../like/likeDto';

@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService, protected commentsService: CommentsService, protected usersService: UsersService) {}

    @Get()
    async getPosts(@Query() postQueryPagination: PostPaginationQueryType, @Req() request: Request) {
        let authUserId = '';
        const queryData = getPostPaginationData(postQueryPagination);
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);
            if (userId) {
                const user = await this.usersService.getUserById(userId);
                authUserId = user.accountData.id;
                const queryData = getPostPaginationData(postQueryPagination);
                return await this.postsService.getPosts(queryData, authUserId);
            }
        }
        return await this.postsService.getPosts(queryData, authUserId);
    }

    @Get(':postId')
    async getPostById(@Param('postId') postId, @Req() request: Request) {
        let authUserId = '';
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);

            if (userId) {
                const user = await this.usersService.getUserById(userId);
                authUserId = user.accountData.id;
                return this.postsService.getPostById(postId, authUserId);
            }
        }
        return this.postsService.getPostById(postId, authUserId);
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

    @Get(':postId/comments')
    async getCommentByPostId(@Param('postId') postId, @Req() request: Request, @Query() commentsQueryPagination: CommentsPaginationQueryType) {
        const post = await this.postsService.getPostById(postId, '');
        if (!post) throw new NotFoundException();
        const queryData = CommentsPaginationData(commentsQueryPagination);
        let authUserId;
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);
            if (userId) {
                const user = await this.usersService.getUserById(userId);
                authUserId = user.accountData.id;
                return await this.commentsService.getCommentsByPostId(postId, authUserId, queryData);
            }
        }
    }

    @Post(':postId/comments')
    @UseGuards(AccessTokenGuard)
    async createComment(@Param('postId') postId, @UserDecorator() user: User, @Body() inputModel: CreateCommentsInputModel) {
        return await this.commentsService.createCommentByPostId(inputModel.content, postId, user);
    }

    @Put(':postId/like-status')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async createLikeByPost(@Param('postId') postId, @Req() request: Request, @UserDecorator() user: User, @Body() inputModel: LikeInputModel) {
        const post = await this.postsService.getPostById(postId, user.accountData.id);
        if (!post) throw new NotFoundException();
        return this.postsService.createLikeByPost(postId, user.accountData.id, inputModel.likeStatus, user.accountData.login);
    }
}
