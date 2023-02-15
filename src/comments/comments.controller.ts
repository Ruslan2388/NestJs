import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Request } from 'express';
import { UsersService } from '../superAdmin/users/users.service';
import { AccessTokenGuard } from '../guard/authMeGuard';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';
import { UpdateCommentsInputModel } from './CommentsDto';
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
                const comment = await this.commentsService.getCommentById(commentId, userId);
                if (!comment) throw new NotFoundException();
                return comment;
            }
        }
        const comment = await this.commentsService.getCommentById(commentId, null);
        if (!comment) throw new NotFoundException();
        return comment;
    }

    @Put(':commentId')
    @UseGuards(AccessTokenGuard)
    @HttpCode(204)
    async updateComment(@Param('commentId') commentId, @Req() request: Request, @UserDecorator() user: User, @Body() inputModel: UpdateCommentsInputModel) {
        const comment = await this.commentsService.getCommentById(commentId, user.accountData.id);
        if (!comment) throw new NotFoundException();
        if (comment.commentatorInfo.userId !== user.accountData.id) throw new ForbiddenException();
        return await this.commentsService.updateCommentById(commentId, inputModel.content, user.accountData.id);
    }

    @Put(':commentId/like-status')
    @UseGuards(AccessTokenGuard)
    @HttpCode(204)
    async createLikeByComment(@Param('commentId') commentId, @Req() request: Request, @UserDecorator() user: User, @Body() inputModel: LikeInputModel) {
        const comment = await this.commentsService.getCommentById(commentId, user.accountData.id);
        if (!comment) throw new NotFoundException();
        console.log(user.accountData.id);
        return await this.commentsService.createLikeByComment(commentId, user.accountData.id, inputModel.likeStatus);
    }

    @Delete(':commentId')
    @UseGuards(AccessTokenGuard)
    @HttpCode(204)
    async deleteComment(@Param('commentId') commentId, @Req() request: Request, @UserDecorator() user: User) {
        const comment = await this.commentsService.getCommentById(commentId, user.accountData.id);
        if (!comment) throw new NotFoundException();
        if (comment.commentatorInfo.userId !== user.accountData.id) throw new ForbiddenException();
        const result = await this.commentsService.deleteComment(commentId);
        if (!result) {
            throw new NotFoundException();
        }
        return result;
    }
}
