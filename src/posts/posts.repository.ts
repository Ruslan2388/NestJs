import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/postsSchema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private PostsModel: Model<PostDocument>,
    ) {}
    async getPosts(queryData): Promise<Post[] | any> {
        const userId = '';
        const objectSort = { [queryData.sortBy]: queryData.sortDirection };
        const totalCount = await this.PostsModel.countDocuments({});
        const page = Number(queryData.pageNumber);
        const pagesCount = Number(
            Math.ceil(Number(totalCount) / queryData.pageSize),
        );
        const pageSize = Number(queryData.pageSize);
        const items = await this.PostsModel.aggregate([
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'postId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Like',
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],
                    as: 'likesCount',
                },
            },
            {
                $lookup: {
                    from: 'likes',
                    localField: '_id',
                    foreignField: 'postId',
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
                    localField: '_id',
                    foreignField: 'postId',
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
                    localField: '_id',
                    foreignField: 'postId',
                    pipeline: [
                        {
                            $match: {
                                status: 'Like',
                            },
                        },
                        {
                            $sort: {
                                addedAt: -1,
                            },
                        },
                        {
                            $limit: 3,
                        },
                        {
                            $project: {
                                addedAt: 1,
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
                    id: '$_id',
                    title: 1,
                    shortDescription: 1,
                    content: 1,
                    blogId: 1,
                    blogName: 1,
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
                    'extendedLikesInfo.newestLikes': '$newestLikes',
                },
            },
            { $unwind: '$likesInfo.likesCount' },
            { $unwind: '$likesInfo.dislikesCount' },
            { $unwind: '$likesInfo.myStatus' },
        ])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .sort(objectSort);
        return { pagesCount, page, pageSize, totalCount, posts: items };
    }

    async getPostsById(postId: string): Promise<Post | null> {
        return this.PostsModel.findOne({ id: postId }, { _id: 0, __v: 0 });
    }
    async getPostsByBlogId(blogId: string) {
        return this.PostsModel.find({ blogId: blogId }, { _id: 0, __v: 0 });
    }
    async createPost(newPost): Promise<Post | null> {
        try {
            return this.PostsModel.create(newPost);
        } catch (e) {
            return null;
        }
    }
    // update
    async deletePostById(postId: string): Promise<number> {
        const result = await this.PostsModel.deleteOne({ id: postId });
        return result.deletedCount;
    }

    async deleteAllPosts() {
        return this.PostsModel.deleteMany({});
    }
}
