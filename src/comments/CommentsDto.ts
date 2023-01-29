import { Prop } from '@nestjs/mongoose';
import { Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentsInputModel {
    @Length(20, 300)
    @Transform(({ value }) => value?.trim())
    content: string;
}
export class UpdateCommentsInputModel {
    @Length(20, 300)
    @Transform(({ value }) => value?.trim())
    content: string;
}
export type CommentsType = {
    id: string;
    parentId: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    likesInfo: {
        likesCount: number;
        dislikesCount: number;
        myStatus: string;
    };
    createdAt: string;
};

export type CommentsPaginationQueryType = {
    content?: string;
    postId: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
};
export const CommentsPaginationData = (query: any): CommentsPaginationQueryType => {
    const postId = query.postId ? query.postId : query.postId;
    const pageSize = isNaN(query.pageSize) ? 10 : query.pageSize;
    const pageNumber = isNaN(query.pageNumber) ? 1 : query.pageNumber;
    const sortBy = query.sortBy === 'login' ? 'login' : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return { postId, pageSize, pageNumber, sortBy, sortDirection };
};
