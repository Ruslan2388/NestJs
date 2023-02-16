import { BloggerRepository } from './blogger.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { IsBoolean } from 'class-validator';

@Injectable()
export class BloggerService {
    constructor(protected blogsRepository: BloggerRepository) {}

    async getBlogger(queryData, user) {
        return this.blogsRepository.getBlogger(queryData, user);
    }

    async getBlogById(blogId: string) {
        const blog = await this.blogsRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        return blog;
    }

    async createBlog(inputModel: CreateBlogInputModelType, user) {
        const newBlog = {
            id: new Date().valueOf().toString(),
            name: inputModel.name,
            description: inputModel.description,
            websiteUrl: inputModel.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
            blogOwnerInfo: {
                userId: user.accountData.id,
                userLogin: user.accountData.login,
            },
            banInfo: {
                isBanned: false,
                banDate: null,
            },
        };
        const result = await this.blogsRepository.createBlog(newBlog);
        if (!result) throw new BadRequestException([{ message: 'Bad', field: 'CantCreateBlog' }]);
        return {
            id: newBlog.id,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership,
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
