import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comments, CommentsDocument } from '../schemas/commentsSchema';
import { Model } from 'mongoose';
import { CommentsPaginationQueryType, CommentsType } from './CommentsDto';
import { Like, LikeDocument } from 'src/schemas/likeSchema';

@Injectable()
export class CommentsRepository {
    constructor(@InjectModel(Comments.name) private CommentsModel: Model<CommentsDocument>, @InjectModel(Like.name) private LikeModel: Model<LikeDocument>) {}

    async getCommentById(commentId: string, userId: string | null) {
        console.log(commentId, userId);
        const items = await this.CommentsModel.aggregate([
            { $match: { id: commentId } },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Like',
                            },
                        },
                        { $count: 'count' },
                    ],
                    as: 'likesCount',
                },
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Dislike',
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],
                    as: 'dislikesCount',
                },
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: { userId: userId },
                        },
                        {
                            $project: { _id: 0, status: 1 },
                        },
                    ],
                    as: 'myStatus',
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    content: 1,
                    userId: 1,
                    userLogin: 1,
                    createdAt: 1,
                    'likesInfo.likesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$likesCount' }, 0] },
                            then: 0,
                            else: '$likesCount.count',
                        },
                    },
                    'likesInfo.dislikesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$dislikesCount' }, 0] },
                            then: 0,
                            else: '$dislikesCount.count',
                        },
                    },
                    'likesInfo.myStatus': {
                        $cond: {
                            if: { $eq: [{ $size: '$myStatus' }, 0] },
                            then: 'None',
                            else: '$myStatus.status',
                        },
                    },
                },
            },
            { $unwind: '$likesInfo.likesCount' },
            { $unwind: '$likesInfo.dislikesCount' },
            { $unwind: '$likesInfo.myStatus' },
        ]);
        console.log(items[0]);
        return items[0];
    }

    async getCommentsByPostId(postId: string, userId: string, queryData: CommentsPaginationQueryType) {
        const objectSort = { [queryData.sortBy]: queryData.sortDirection };
        const totalCount = await this.CommentsModel.countDocuments({ parentId: postId });
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const page = Number(queryData.pageNumber);
        const pageSize = Number(queryData.pageSize);
        const items = await this.CommentsModel.aggregate([
            { $match: { parentId: postId } },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Like',
                            },
                        },
                        { $count: 'count' },
                    ],
                    as: 'likesCount',
                },
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Dislike',
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],
                    as: 'dislikesCount',
                },
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: { userId: userId },
                        },
                        {
                            $project: { _id: 0, status: 1 },
                        },
                    ],
                    as: 'myStatus',
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    content: 1,
                    userId: 1,
                    userLogin: 1,
                    createdAt: 1,
                    'likesInfo.likesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$likesCount' }, 0] },
                            then: 0,
                            else: '$likesCount.count',
                        },
                    },
                    'likesInfo.dislikesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$dislikesCount' }, 0] },
                            then: 0,
                            else: '$dislikesCount.count',
                        },
                    },
                    'likesInfo.myStatus': {
                        $cond: {
                            if: { $eq: [{ $size: '$myStatus' }, 0] },
                            then: 'None',
                            else: '$myStatus.status',
                        },
                    },
                    //
                },
            },
            { $unwind: '$likesInfo.likesCount' },
            { $unwind: '$likesInfo.dislikesCount' },
            { $unwind: '$likesInfo.myStatus' },
        ])
            .sort(objectSort)
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        console.log(items);
        return { pagesCount, page, pageSize, totalCount, items };
    }

    async createComments(newComment: CommentsType) {
        return await this.CommentsModel.create(newComment);
    }

    async updateCommentById(commentId, content: string, userId: string) {
        const result = await this.CommentsModel.updateOne({ id: commentId, userId }, { $set: { content } });
        return result.modifiedCount === 1;
    }

    async createLikeByComment(commentId: string, userId: string, likeStatus: string) {
        return this.LikeModel.updateOne({ parentId: commentId, userId: userId }, { status: likeStatus }, { upsert: true });
    }

    async deleteCommentById(commentId) {
        const result = await this.CommentsModel.deleteOne({ id: commentId });
        return result.deletedCount === 1;
    }

    async deleteAllComments() {
        return this.CommentsModel.deleteMany({});
    }

    async deleteAllLikes() {
        return this.LikeModel.deleteMany({});
    }
}
