import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '../schemas/postsSchema';
import { CreatePostInputModelType } from '../type/posts.type';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
export class PostsService {
    constructor(
        protected postsRepository: PostsRepository,
        protected blogsRepository: BlogsRepository,
    ) {}
    getPosts() {
        return this.postsRepository.getPosts();
    }
    getPostById(postId: string): Promise<Post | null> {
        return this.postsRepository.getPostsById(postId);
    }
    getPostsByBlogId(blogId: string): Promise<Post[] | null | Post> {
        return this.postsRepository.getPostsByBlogId(blogId);
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
            };
            const result = this.postsRepository.createPost(newPost);
            if (!result) throw new BadRequestException();
            return {
                id: newPost.id,
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt,
            };
        }
        throw new NotFoundException();
    }
    async createPostsByBlogId(
        inputModel: CreatePostInputModelType,
        blogId: string,
    ) {
        const blog = await this.blogsRepository.getBlogById(blogId);
        if (blog) {
            const newPost = {
                id: new Date().valueOf().toString(),
                title: inputModel.title,
                shortDescription: inputModel.shortDescription,
                content: inputModel.content,
                blogId: blogId,
                blogName: blog.name,
                createdAt: new Date().toISOString(),
            };
            const result = this.postsRepository.createPost(newPost);
            if (!result) throw new BadRequestException();
            return {
                id: newPost.id,
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt,
            };
        }
        throw new NotFoundException();
    }
    async deletePostById(postId: string) {
        return this.postsRepository.deletePostById(postId);
    }
}
