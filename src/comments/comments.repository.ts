import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comments, CommentsDocument } from '../schemas/commentsSchema';
import { Model } from 'mongoose';
import { Like, LikeDocument } from 'src/schemas/likeSchema';
import { User, UserDocument } from '../schemas/usersSchema';
import { CommentQueryDto } from './CommentsDto';
import { Post, PostDocument } from '../schemas/postsSchema';

@Injectable()
export class CommentsRepository {
    constructor(
        @InjectModel(Comments.name) private commentsModel: Model<CommentsDocument>,
        @InjectModel(Post.name) private postsModel: Model<PostDocument>,
        @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async getCommentById(commentId: string, userId: string | null) {
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });

        const items = await this.commentsModel.aggregate([
            { $match: { id: commentId, 'commentatorInfo.userId': { $nin: bannedUser } } },
            {
                $lookup: {
                    from: 'likes',
                    localField: 'id',
                    foreignField: 'parentId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Like',
                                userId: { $nin: bannedUser },
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
                                userId: { $nin: bannedUser },
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
                    'commentatorInfo.userId': 1,
                    'commentatorInfo.userLogin': 1,
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
        return items[0];
    }

    async getCommentsByPostId(postId: string, userId: string, queryData) {
        const objectSort = { [queryData.sortBy]: queryData.sortDirection };
        const totalCount = await this.commentsModel.countDocuments({ parentId: postId });
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const page = Number(queryData.pageNumber);
        const pageSize = Number(queryData.pageSize);
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });
        const items = await this.commentsModel
            .aggregate([
                { $match: { parentId: postId, 'commentatorInfo.userId': { $nin: bannedUser } } },
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {
                                    status: 'Like',
                                    userId: { $nin: bannedUser },
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
                                    userId: { $nin: bannedUser },
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
                        'commentatorInfo.userId': 1,
                        'commentatorInfo.userLogin': 1,
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
        return { pagesCount, page, pageSize, totalCount, items };
    }
    //  { $match: { 'postInfo.id': { $in: allUsersPosts }, 'commentatorInfo.userId': { $nin: bannedUser } } },
    async getAllComments(queryData, userId) {
        const objectSort = { [queryData.sortBy]: queryData.sortDirection };
        const allUsersPosts = await this.postsModel.distinct('id', { userId: userId });
        const totalCount = await this.commentsModel.countDocuments({ 'postInfo.id': { $in: allUsersPosts } });
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize));
        const page = Number(queryData.pageNumber);
        const pageSize = Number(queryData.pageSize);
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });
        const items = await this.commentsModel
            .aggregate([
                { $match: { 'postInfo.id': { $in: allUsersPosts }, 'commentatorInfo.userId': { $nin: bannedUser } } },
                {
                    $lookup: {
                        from: 'likes',
                        localField: 'id',
                        foreignField: 'parentId',
                        pipeline: [
                            {
                                $match: {
                                    status: 'Like',
                                    userId: { $nin: bannedUser },
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
                                    userId: { $nin: bannedUser },
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
                        postInfo: 1,
                        content: 1,
                        createdAt: 1,
                        commentatorInfo: 1,
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
        //  const items = await this.commentsModel.find({ 'postInfo.id': { $in: allUsersPosts } }, { _id: 0, __v: 0, parentId: 0 });

        return { pagesCount, page, pageSize, totalCount, items };
    }

    async createComments(newComment) {
        return await this.commentsModel.create(newComment);
    }

    async updateCommentById(commentId, content: string, userId: string) {
        const result = await this.commentsModel.updateOne({ id: commentId, userId }, { $set: { content } });
        return result.modifiedCount === 1;
    }

    async createLikeByComment(commentId: string, userId: string, likeStatus: string) {
        return this.likeModel.updateOne({ parentId: commentId, userId: userId }, { status: likeStatus }, { upsert: true });
    }

    async deleteCommentById(commentId) {
        const result = await this.commentsModel.deleteOne({ id: commentId });
        return result.deletedCount === 1;
    }

    async deleteAllComments() {
        return this.commentsModel.deleteMany({});
    }

    async deleteAllLikes() {
        return this.likeModel.deleteMany({});
    }
}
