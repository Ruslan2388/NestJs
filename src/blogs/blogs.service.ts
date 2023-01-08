import { BlogsRepository } from './blogs.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBlogInputModelType } from '../type/blogs.type';

@Injectable()
export class BlogsService {
    constructor(protected blogsRepository: BlogsRepository) {}

    getBlogs() {
        return this.blogsRepository.getBlogs();
    }

    getBlogById(blogId: string) {
        return this.blogsRepository.getBlogById(blogId);
    }

    async createBlog(inputModel: CreateBlogInputModelType) {
        const newBlog = {
            id: new Date().valueOf().toString(),
            name: inputModel.name,
            description: inputModel.description,
            websiteUrl: inputModel.websiteUrl,
            createdAt: new Date().toISOString(),
        };
        const result = await this.blogsRepository.createBlog(newBlog);
        if (!result) throw new BadRequestException();
        return {
            id: newBlog.id,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
        };
    }

    async updateBlogByBlogId(
        blogId: string,
        updateModel: CreateBlogInputModelType,
    ) {
        const result = await this.blogsRepository.updateBlogByBlogId(
            blogId,
            updateModel,
        );
        return result;
    }

    async deleteBlogByBlogId(blogId) {
        return await this.blogsRepository.deleteBlogById(blogId);
    }
}
