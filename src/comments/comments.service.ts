import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { User } from '../schemas/usersSchema';
import { QueryPostsRepository } from '../postsQuery/QueryPosts.repository';
import { BloggerRepository } from '../blogger/blogger.repository';
import { CommentQueryDto } from './CommentsDto';

@Injectable()
export class CommentsService {
    constructor(protected commentsRepository: CommentsRepository, protected queryPostsRepository: QueryPostsRepository, protected bloggerRepository: BloggerRepository) {}
    async getCommentById(commentId: string, userId: string) {
        return await this.commentsRepository.getCommentById(commentId, userId);
    }

    async getCommentsByPostId(postId: string, userId: string, queryData) {
        return this.commentsRepository.getCommentsByPostId(postId, userId, queryData);
    }

    async getAllComments(queryData: CommentQueryDto, userId: string) {
        return this.commentsRepository.getAllComments(queryData, userId);
    }

    async createCommentByPostId(content: string, postId: string, user: User) {
        const post = await this.queryPostsRepository.getPostsById(postId, user.accountData.id);
        if (!post) throw new NotFoundException();

        const blog = await this.bloggerRepository.checkUserOnBan(post.blogId, user.accountData.id);
        if (blog) throw new ForbiddenException();
        const newComment = {
            id: (+new Date()).toString(),
            content: content,
            commentatorInfo: {
                userId: user.accountData.id,
                userLogin: user.accountData.login,
            },
            parentId: postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
            },
            createdAt: new Date().toISOString(),
            postInfo: { id: post.id, title: post.title, blogId: post.blogId, blogName: post.blogName },
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
