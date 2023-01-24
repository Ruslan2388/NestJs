import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { User } from '../schemas/usersSchema';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsPaginationQueryType, CommentsType } from './CommentsDto';

@Injectable()
export class CommentsService {
    constructor(protected commentsRepository: CommentsRepository, protected postsRepository: PostsRepository) {}
    async getCommentById(commentId: string, userId: string) {
        return this.commentsRepository.getCommentById(commentId, userId);
    }

    async getCommentsByPostId(postId: string, userId: string, queryData: CommentsPaginationQueryType) {
        return this.commentsRepository.getCommentsByPostId(postId, userId, queryData);
    }

    async createCommentByPostId(content: string, postId: string, user: User) {
        const post = await this.postsRepository.getPostsById(postId);
        if (!post) throw new NotFoundException();
        const newComment: CommentsType = {
            id: (+new Date()).toString(),
            content: content,
            userId: user.accountData.id,
            userLogin: user.accountData.login,
            parentId: postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
            },
            createdAt: new Date().toISOString(),
        };
        await this.commentsRepository.createComments(newComment);
        delete newComment.parentId;
        return newComment;
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
