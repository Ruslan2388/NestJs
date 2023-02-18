import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '../../schemas/postsSchema';
import { CreatePostByBlogIdInputModelType, CreatePostInputModelType, UpdatePostInputModelType } from '../../postsQuery/PostDto';
import { BloggerRepository } from '../blogger.repository';
import { NewestLikesType } from '../../helper/pagination';
import { BlogsRepository } from '../../blogsQuery/blogs.repository';

@Injectable()
export class PostsService {
    constructor(protected postsRepository: PostsRepository, protected queryBlogsRepository: BlogsRepository) {}

    async getPostsByBlogId(queryData, blogId: string, userId: string): Promise<Post[] | null | Post> {
        const blog = await this.queryBlogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        return this.postsRepository.getPostsByBlogId(queryData, blogId, userId);
    }

    async createPost(inputModel: CreatePostInputModelType) {
        const blog = await this.queryBlogsRepository.getBlogById(inputModel.blogId);
        if (blog) {
            const newPost = {
                id: new Date().valueOf().toString(),
                title: inputModel.title,
                shortDescription: inputModel.shortDescription,
                content: inputModel.content,
                blogId: inputModel.blogId,
                blogName: blog.name,
                createdAt: new Date().toISOString(),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: [],
                },
            };
            const result = this.postsRepository.createPost(newPost);

            if (!result)
                throw new BadRequestException({
                    message: 'Bad',
                    field: 'NotCreatePost',
                });
            return {
                id: newPost.id,
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt,
                extendedLikesInfo: {
                    likesCount: newPost.extendedLikesInfo.likesCount,
                    dislikesCount: newPost.extendedLikesInfo.dislikesCount,
                    myStatus: newPost.extendedLikesInfo.myStatus,
                    newestLikes: [],
                },
            };
        }
        throw new NotFoundException();
    }

    async createPostsByBlogId(inputModel: CreatePostByBlogIdInputModelType, blogId: string, userId: string) {
        const blog = await this.queryBlogsRepository.getBlogById(blogId);
        if (!blog) {
            throw new NotFoundException();
        }
        console.log(userId);
        if (blog) {
            const newPost = {
                id: new Date().valueOf().toString(),
                title: inputModel.title,
                shortDescription: inputModel.shortDescription,
                content: inputModel.content,
                blogId: blogId,
                userId: userId,
                blogName: blog.name,
                createdAt: new Date().toISOString(),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: [],
                },
            };
            const result = this.postsRepository.createPost(newPost);
            if (!result) throw new BadRequestException([{ message: 'Bad', field: 'NotCreatePost' }]);
            return {
                id: newPost.id,
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt,
                extendedLikesInfo: {
                    likesCount: newPost.extendedLikesInfo.likesCount,
                    dislikesCount: newPost.extendedLikesInfo.dislikesCount,
                    myStatus: newPost.extendedLikesInfo.myStatus,
                    newestLikes: [],
                },
            };
        }
        throw new NotFoundException();
    }

    async updatePostByPostId(blogId: string, postId: string, updateModel: UpdatePostInputModelType, userId: string) {
        const blog = await this.queryBlogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
        const result = await this.postsRepository.updatePostByPostId(postId, updateModel, blogId);
        if (!result) throw new NotFoundException();
        return result;
    }

    async createLikeByPost(postId, userId: string, likeStatus: string, login: string) {
        const createdAt = new Date().toISOString();
        return this.postsRepository.createLikeByPost(postId, userId, likeStatus, login, createdAt);
    }

    async deletePostByBlogId(blogId: string, postId: string, userId: string) {
        const blog = await this.queryBlogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
        const result = await this.postsRepository.deletePostByBlogId(postId);
        if (!result) throw new NotFoundException();
        return result;
    }
}
