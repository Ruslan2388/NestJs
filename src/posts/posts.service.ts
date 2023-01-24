import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '../schemas/postsSchema';
import { CreatePostByBlogIdInputModelType, CreatePostInputModelType, UpdatePostInputModelType } from './PostDto';
import { BlogsRepository } from '../blogs/blogs.repository';
import { NewestLikesType } from '../helper/pagination';

@Injectable()
export class PostsService {
    constructor(protected postsRepository: PostsRepository, protected blogsRepository: BlogsRepository) {}
    getPosts(queryData, userId) {
        return this.postsRepository.getPosts(queryData, userId);
    }
    async getPostById(postId: string, userId: string | null): Promise<Post | null> {
        const post = await this.postsRepository.getPostsById(postId);
        if (!post) throw new NotFoundException();

        const likeByPost = await this.postsRepository.likeByPost(userId, postId);

        const like = likeByPost.like;

        const newestLikes: NewestLikesType[] = likeByPost.newestLikes;
        if (like != null) {
            if (like.status === 'Like' || like.status === 'Dislike' || like.status === 'None') {
                post.extendedLikesInfo.myStatus = like.status;
            }
        }
        post.extendedLikesInfo.newestLikes = newestLikes;
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

    async createPostsByBlogId(inputModel: CreatePostByBlogIdInputModelType, blogId: string) {
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

    createLikeByPost(postId, userId: string, likeStatus: string, login: string) {
        const createdAt = new Date().toISOString();
        return this.postsRepository.createLikeByPost(postId, userId, likeStatus, login, createdAt);
    }
}
