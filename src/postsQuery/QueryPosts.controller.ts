import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { PostQueryDto } from './PostDto';
import { AccessTokenGuard } from '../guard/authMeGuard';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';
import { CreateCommentsInputModel } from '../comments/CommentsDto';
import { CommentsService } from '../comments/comments.service';
import { Request } from 'express';
import { UsersService } from '../superAdmin/users/users.service';
import { LikeInputModel } from '../like/likeDto';
import { QueryPostsService } from './QueryPosts.service';

@Controller('posts')
export class QueryPostsController {
    constructor(protected queryPostsService: QueryPostsService, protected commentsService: CommentsService, protected usersService: UsersService) {}

    @Get()
    async getPosts(@Query() queryData: PostQueryDto, @Req() request: Request) {
        let authUserId = '';
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);
            if (userId) {
                const user = await this.usersService.getUserById(userId);
                authUserId = user.accountData.id;
                return await this.queryPostsService.getPosts(queryData, authUserId);
            }
        }
        return await this.queryPostsService.getPosts(queryData, authUserId);
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
                return this.queryPostsService.getPostById(postId, authUserId);
            }
        }
        return this.queryPostsService.getPostById(postId, authUserId);
    }

    @Get(':postId/comments')
    async getCommentByPostId(@Param('postId') postId, @Req() request: Request, @Query() queryData: PostQueryDto) {
        const post = await this.queryPostsService.getPostById(postId, '');
        if (!post) throw new NotFoundException();
        let authUserId;

        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);
            if (userId) {
                const user = await this.usersService.getUserById(userId);
                authUserId = user.accountData.id;
                return await this.commentsService.getCommentsByPostId(postId, authUserId, queryData);
            }
            return await this.commentsService.getCommentsByPostId(postId, null, queryData);
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
        const post = await this.queryPostsService.getPostById(postId, user.accountData.id);
        if (!post) throw new NotFoundException();
        return this.queryPostsService.createLikeByPost(postId, user.accountData.id, inputModel.likeStatus, user.accountData.login);
    }
}
