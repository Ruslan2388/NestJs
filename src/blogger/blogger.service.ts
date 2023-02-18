import { BloggerRepository } from './blogger.repository';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { BanUserForBlogUpdateModel } from '../superAdmin/users/UserDto';
import { BlogsRepository } from '../blogsQuery/blogs.repository';

@Injectable()
export class BloggerService {
    constructor(protected bloggerRepository: BloggerRepository, protected queryBlogsRepository: BlogsRepository) {}

    async getBlogger(queryData, user) {
        return this.bloggerRepository.getBlogger(queryData, user);
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
        const result = await this.bloggerRepository.createBlog(newBlog);
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
        const result = await this.bloggerRepository.updateBlogByBlogId(blogId, updateModel);
        if (!result) throw new NotFoundException();
        return result;
    }

    async banUserForBlog(userId: string, updateModel: BanUserForBlogUpdateModel, ownerBlogUserId: string) {
        const blog = await this.queryBlogsRepository.getBlogById(updateModel.blogId);
        console.log(blog.blogOwnerInfo.userId);
        if (blog.blogOwnerInfo.userId !== ownerBlogUserId) {
            throw new ForbiddenException();
        }

        return this.bloggerRepository.banUserForBlog(userId, updateModel);
    }

    async deleteBlogByBlogId(blogId) {
        return await this.bloggerRepository.deleteBlogById(blogId);
    }
}
