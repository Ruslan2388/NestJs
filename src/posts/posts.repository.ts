import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/postsSchema';
import { Model } from 'mongoose';
import { UpdatePostInputModelType } from './PostDto';
import { Like, LikeDocument } from '../schemas/likeSchema';
import { NewestLikesType } from '../helper/pagination';

@Injectable()
export class PostsRepository {
    constructor(@InjectModel(Post.name) private PostsModel: Model<PostDocument>, @InjectModel(Like.name) private LikeModel: Model<LikeDocument>) {}

    async getPosts(queryData, userId: string): Promise<Post[] | any> {
        const totalCount = await this.PostsModel.countDocuments({});
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const items = await this.PostsModel.aggregate([
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
                    'extendedLikesInfo.likesCount': 1,
                    'extendedLikesInfo.dislikesCount': 1,
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
            { $unwind: '$extendedLikesInfo.myStatus' },
        ])
            .sort({ [`accountData.${queryData.sortBy}`]: queryData.sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        return { pagesCount, page, pageSize, totalCount, items };
    }

    async getPostsById(postId: string): Promise<Post | null> {
        return this.PostsModel.findOne({ id: postId }, { _id: 0, __v: 0 });
    }

    async getPostsByBlogId(queryData, blogId): Promise<Post[] | any> {
        const userId = '';
        // const objectSort = { [queryData.sortBy]: queryData.sortDirection };
        const totalCount = await this.PostsModel.countDocuments({
            blogId: blogId,
        });
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(Math.ceil(Number(totalCount) / queryData.pageSize));
        const pageSize = Number(queryData.pageSize);
        const items = await this.PostsModel.aggregate([
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
                    'extendedLikesInfo.likesCount': 1,
                    'extendedLikesInfo.dislikesCount': 1,
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
            { $unwind: '$extendedLikesInfo.myStatus' },
        ])
            .sort({ [queryData.sortBy]: queryData.sortDirection })
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        return { pagesCount, page, pageSize, totalCount, items };
    }
    async createPost(newPost): Promise<Post | null> {
        try {
            return this.PostsModel.create(newPost);
        } catch (e) {
            return null;
        }
    }

    async updatePostByPostId(postId, updateModel: UpdatePostInputModelType) {
        const result = await this.PostsModel.updateOne(
            { id: postId },
            {
                title: updateModel.title,
                content: updateModel.content,
                websiteUrl: updateModel.blogId,
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
        const likesCount = await this.LikeModel.countDocuments({ parentId: postId, status: 'Like' });
        const dislikesCount = await this.LikeModel.countDocuments({ parentId: postId, status: 'Dislike' });
        await this.PostsModel.updateOne(
            { id: postId },
            {
                'extendedLikesInfo.likesCount': likesCount,
                'extendedLikesInfo.dislikesCount': dislikesCount,
            },
        );
        return true;
    }

    async likeByPost(userId: string, postId: string) {
        const newestLikes: NewestLikesType[] = await this.LikeModel.find({ parentId: postId, status: 'Like' }, { _id: 0, userId: 1, login: 1, addedAt: '$createdAt' })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();
        const like = await this.LikeModel.findOne({ userId: userId, parentId: postId });

        return { newestLikes, like };
    }
}
