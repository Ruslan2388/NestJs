import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, LikeDocument } from 'src/schemas/likeSchema';
import { Post, PostDocument } from '../schemas/postsSchema';
import { User, UserDocument } from '../schemas/usersSchema';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../schemas/blogsSchema';

@Injectable()
export class QueryPostsRepository {
    constructor(
        @InjectModel(Post.name) private PostsModel: Model<PostDocument>,
        @InjectModel(Like.name) private LikeModel: Model<LikeDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    ) {}

    async getPosts(queryData, userId: string): Promise<Post[] | any> {
        const bannedBlog = await this.blogModel.distinct('id', { 'banInfo.isBanned': true });
        const totalCount = await this.PostsModel.countDocuments({});
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });
        const items = await this.PostsModel.aggregate([
            { $match: { userId: { $nin: bannedUser }, blogId: { $nin: bannedBlog } } },
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
                        {
                            $sort: {
                                createdAt: -1,
                            },
                        },
                        {
                            $limit: 3,
                        },
                        {
                            $project: {
                                addedAt: '$createdAt',
                                login: 1,
                                userId: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: 'newestLikes',
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    title: 1,
                    shortDescription: 1,
                    content: 1,
                    blogId: 1,
                    blogName: 1,
                    createdAt: 1,
                    'extendedLikesInfo.likesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$likesCount' }, 0] },
                            then: 0,
                            else: '$likesCount.count',
                        },
                    },
                    'extendedLikesInfo.dislikesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$dislikesCount' }, 0] },
                            then: 0,
                            else: '$dislikesCount.count',
                        },
                    },
                    'extendedLikesInfo.myStatus': {
                        $cond: {
                            if: { $eq: [{ $size: '$myStatus' }, 0] },
                            then: 'None',
                            else: '$myStatus.status',
                        },
                    },
                    'extendedLikesInfo.newestLikes': '$newestLikes',
                },
            },
            { $unwind: '$extendedLikesInfo.likesCount' },
            { $unwind: '$extendedLikesInfo.dislikesCount' },
            { $unwind: '$extendedLikesInfo.myStatus' },
        ])
            .sort({ [queryData.sortBy]: queryData.sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        return { pagesCount, page, pageSize, totalCount, items };
    }

    async getPostsById(postId: string, userId): Promise<Post | null> {
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });
        const bannedBlog = await this.blogModel.distinct('id', { 'banInfo.isBanned': true });
        const items = await this.PostsModel.aggregate([
            { $match: { id: postId, userId: { $nin: bannedUser }, blogId: { $nin: bannedBlog } } },
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
                        {
                            $sort: {
                                createdAt: -1,
                            },
                        },
                        {
                            $limit: 3,
                        },
                        {
                            $project: {
                                addedAt: '$createdAt',
                                login: 1,
                                userId: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: 'newestLikes',
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    title: 1,
                    shortDescription: 1,
                    content: 1,
                    blogId: 1,
                    blogName: 1,
                    createdAt: 1,
                    'extendedLikesInfo.likesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$likesCount' }, 0] },
                            then: 0,
                            else: '$likesCount.count',
                        },
                    },
                    'extendedLikesInfo.dislikesCount': {
                        $cond: {
                            if: { $eq: [{ $size: '$dislikesCount' }, 0] },
                            then: 0,
                            else: '$dislikesCount.count',
                        },
                    },
                    'extendedLikesInfo.myStatus': {
                        $cond: {
                            if: { $eq: [{ $size: '$myStatus' }, 0] },
                            then: 'None',
                            else: '$myStatus.status',
                        },
                    },
                    'extendedLikesInfo.newestLikes': '$newestLikes',
                },
            },
            { $unwind: '$extendedLikesInfo.likesCount' },
            { $unwind: '$extendedLikesInfo.dislikesCount' },
            { $unwind: '$extendedLikesInfo.myStatus' },
        ]);
        return items[0];
    }

    async createLikeByPost(postId, userId: string, likeStatus: string, login: string, createdAt: string) {
        await this.LikeModel.updateOne(
            { parentId: postId, userId: userId },
            {
                status: likeStatus,
                login: login,
                createdAt: createdAt,
            },
            { upsert: true },
        );
        return true;
    }
}
