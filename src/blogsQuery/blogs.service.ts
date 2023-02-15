import { BlogsRepository } from './blogs.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { IsBoolean } from 'class-validator';

@Injectable()
export class BlogsService {
    constructor(protected blogsRepository: BlogsRepository) {}

    async getBlogs(queryData) {
        return this.blogsRepository.getBlogs(queryData);
    }

    async getBlogById(blogId: string) {
        const blog = await this.blogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        return blog;
    }
}
