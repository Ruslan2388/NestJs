import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { AccessTokenGuard } from '../guard/authMeGuard';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';
import { CreateCommentsInputModel, UpdateCommentsInputModel } from './CommentsDto';
import { LikeInputModel } from '../like/likeDto';

@Controller('comments')
export class CommentsController {
    constructor(protected commentsService: CommentsService, protected usersService: UsersService) {}
    @Get(':commentId')
    @HttpCode(200)
    async getCommentById(@Param('commentId') commentId, @Req() request: Request) {
        if (request.headers.authorization) {
            const token = request.headers.authorization.split(' ')[1];
            const userId = await this.usersService.getUserIdByAccessToken(token);
            if (userId) {
                return await this.commentsService.getCommentById(commentId, userId);
            }
        }
        return await this.commentsService.getCommentById(commentId, null);
    }

    @Put(':commentId')
    @UseGuards(AccessTokenGuard)
    @HttpCode(204)
    async updateComment(@Param('commentId') commentId, @Req() request: Request, @UserDecorator() user: User, @Body() inputModel: UpdateCommentsInputModel) {
        const comment = await this.commentsService.getCommentById(commentId, user.accountData.id);
        if (!comment) throw new NotFoundException();
        if (comment.userId !== user.accountData.id) throw new UnauthorizedException();
        return await this.commentsService.updateCommentById(commentId, inputModel.content, user.accountData.id);
    }

    @Put(':commentId/like-status')
    @UseGuards(AccessTokenGuard)
    @HttpCode(204)
    async createLikeByComment(@Param('commentId') commentId, @Req() request: Request, @UserDecorator() user: User, @Body() inputModel: LikeInputModel) {
        const comment = await this.commentsService.getCommentById(commentId, user.accountData.id);
        if (!comment) throw new NotFoundException();
        if (comment.userId !== user.accountData.id) throw new UnauthorizedException();
        return await this.commentsService.createLikeByComment(commentId, user.accountData.id, inputModel.likeStatus);
    }

    @Delete(':commentId')
    @UseGuards(AccessTokenGuard)
    @HttpCode(204)
    async deleteComment(@Param('commentId') commentId, @Req() request: Request, @UserDecorator() user: User, @Body() inputModel: UpdateCommentsInputModel) {
        const comment = await this.commentsService.getCommentById(commentId, user.accountData.id);
        if (!comment) throw new NotFoundException();
        if (comment.userId !== user.accountData.id) throw new UnauthorizedException();
        return await this.commentsService.deleteComment(commentId);
    }
}
