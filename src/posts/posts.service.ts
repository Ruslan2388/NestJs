import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '../schemas/postsSchema';
import { CreatePostInputModelType, UpdatePostInputModelType } from './PostDto';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
export class PostsService {
    constructor(protected postsRepository: PostsRepository, protected blogsRepository: BlogsRepository) {}
    getPosts(queryData) {
        return this.postsRepository.getPosts(queryData);
    }
    async getPostById(postId: string): Promise<Post | null> {
        const post = await this.postsRepository.getPostsById(postId);
        if (!post) throw new NotFoundException();
        return post;
    }
    async getPostsByBlogId(queryData, blogId: string): Promise<Post[] | null | Post> {
        const blog = await this.blogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        return this.postsRepository.getPostsByBlogId(queryData, blogId);
    }

    async createPost(inputModel: CreatePostInputModelType) {
        const blog = await this.blogsRepository.getBlogById(inputModel.blogId);
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

    async createPostsByBlogId(inputModel: CreatePostInputModelType, blogId: string) {
        const blog = await this.blogsRepository.getBlogById(blogId);
        if (!blog) {
            throw new NotFoundException();
        }
        if (blog) {
            const newPost = {
                id: new Date().valueOf().toString(),
                title: inputModel.title,
                shortDescription: inputModel.shortDescription,
                content: inputModel.content,
                blogId: blogId,
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

    async updatePostByPostId(postId, updateModel: UpdatePostInputModelType) {
        const result = await this.postsRepository.updatePostByPostId(postId, updateModel);
        const blog = this.blogsRepository.getBlogById(updateModel.blogId);
        if (!blog) throw new NotFoundException();
        if (!result) throw new NotFoundException();
        return result;
    }

    async deletePostById(postId: string) {
        return this.postsRepository.deletePostById(postId);
    }
}
