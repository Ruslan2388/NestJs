import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '../../schemas/postsSchema';
import { CreatePostByBlogIdInputModelType, UpdatePostInputModelType } from '../../postsQuery/PostDto';
import { BlogsRepository } from '../../blogsQuery/blogs.repository';

@Injectable()
export class PostsService {
    constructor(protected postsRepository: PostsRepository, protected queryBlogsRepository: BlogsRepository) {}

    async getPostsByBlogId(queryData, blogId: string, userId: string): Promise<Post[] | null | Post> {
        const blog = await this.queryBlogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        return this.postsRepository.getPostsByBlogId(queryData, blogId, userId);
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
