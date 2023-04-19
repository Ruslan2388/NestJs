import { BlogsRepository } from './blogs.repository';
import { Injectable, NotFoundException } from '@nestjs/common';

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
