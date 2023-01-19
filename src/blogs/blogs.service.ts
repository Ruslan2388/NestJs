import { BlogsRepository } from './blogs.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';

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

    async createBlog(inputModel: CreateBlogInputModelType) {
        const newBlog = {
            id: new Date().valueOf().toString(),
            name: inputModel.name,
            description: inputModel.description,
            websiteUrl: inputModel.websiteUrl,
            createdAt: new Date().toISOString(),
        };
        const result = await this.blogsRepository.createBlog(newBlog);
        if (!result) throw new BadRequestException([{ message: 'Bad', field: 'CantCreateBlog' }]);
        return {
            id: newBlog.id,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
        };
    }

    async updateBlogByBlogId(blogId: string, updateModel: UpdateBlogInputModelType) {
        const result = await this.blogsRepository.updateBlogByBlogId(blogId, updateModel);
        if (!result) throw new NotFoundException();
        return result;
    }

    async deleteBlogByBlogId(blogId) {
        return await this.blogsRepository.deleteBlogById(blogId);
    }
}
