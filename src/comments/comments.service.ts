import { Injectable } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentQueryDto } from './CommentsDto';

@Injectable()
export class CommentsService {
    constructor(protected commentsRepository: CommentsRepository) {}
    async getCommentById(commentId: string, userId: string) {
        return await this.commentsRepository.getCommentById(commentId, userId);
    }

    async getCommentsByPostId(postId: string, userId: string, queryData) {
        return this.commentsRepository.getCommentsByPostId(postId, userId, queryData);
    }

    async getAllComments(queryData: CommentQueryDto, userId: string) {
        return this.commentsRepository.getAllComments(queryData, userId);
    }

    async updateCommentById(commentId, content: string, userId: string) {
        return this.commentsRepository.updateCommentById(commentId, content, userId);
    }

    async deleteComment(commentId) {
        return this.commentsRepository.deleteCommentById(commentId);
    }

    async createLikeByComment(commentId: string, userId: string, likeStatus: string) {
        return this.commentsRepository.createLikeByComment(commentId, userId, likeStatus);
    }
}
