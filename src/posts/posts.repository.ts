import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/postsSchema';
import { Model } from 'mongoose';
import { UpdatePostInputModelType } from './PostDto';
import { Like, LikeDocument } from '../schemas/likeSchema';
import { NewestLikesType } from '../helper/pagination';
import { User, UserDocument } from '../schemas/usersSchema';

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private PostsModel: Model<PostDocument>,
        @InjectModel(Like.name) private LikeModel: Model<LikeDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    async getPosts(queryData, userId: string): Promise<Post[] | any> {
        const totalCount = await this.PostsModel.countDocuments({});
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });
        const items = await this.PostsModel.aggregate([
            { $match: { userId: { $nin: bannedUser } } },
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

        const items = await this.PostsModel.aggregate([
            { $match: { id: postId, userId: { $nin: bannedUser } } },
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

    async getPostsByBlogId(queryData, blogId: string, userId: string): Promise<Post[] | any> {
        const totalCount = await this.PostsModel.countDocuments({
            blogId: blogId,
        });
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const bannedUser = await this.userModel.distinct('accountData.id', { 'accountData.banInfo.isBanned': true });
        const items = await this.PostsModel.aggregate([
            { $match: { userId: { $nin: bannedUser } } },
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
            { $match: { blogId: blogId } },
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
    async createPost(newPost): Promise<Post | null> {
        console.log(newPost.userId);
        try {
            return this.PostsModel.create(newPost);
        } catch (e) {
            return null;
        }
    }

    async updatePostByPostId(postId, updateModel: UpdatePostInputModelType, blogId: string) {
        const result = await this.PostsModel.updateOne(
            { id: postId },
            {
                title: updateModel.title,
                content: updateModel.content,
                blogId: updateModel.blogId,
                shortDescription: updateModel.shortDescription,
            },
        );
        return result.matchedCount;
    }

    async deletePostById(postId: string): Promise<number> {
        const result = await this.PostsModel.deleteOne({ id: postId });
        return result.deletedCount;
    }

    async deleteAllPosts() {
        return this.PostsModel.deleteMany({});
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

    async deletePostByBlogId(postId: string) {
        const result = await this.PostsModel.deleteOne({ id: postId });
        return result.deletedCount;
    }
}
