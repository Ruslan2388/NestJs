import { BloggerRepository } from './blogger.repository';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { BanUserForBlogUpdateModel } from '../superAdmin/users/UserDto';
import { BlogsRepository } from '../blogsQuery/blogs.repository';
import { UsersRepository } from '../superAdmin/users/users.repository';

@Injectable()
export class BloggerService {
    constructor(protected bloggerRepository: BloggerRepository, protected queryBlogsRepository: BlogsRepository, protected usersRepository: UsersRepository) {}

    async getBlogger(queryData, user) {
        return this.bloggerRepository.getBlogger(queryData, user);
    }
    async getBlogById(blogId) {
        return this.bloggerRepository.getBlogById(blogId);
    }

    async updateBlogByBlogId(blogId: string, updateModel: UpdateBlogInputModelType) {
        const result = await this.bloggerRepository.updateBlogByBlogId(blogId, updateModel);
        if (!result) throw new NotFoundException();
        return result;
    }

    async banUserForBlog(userId: string, updateModel: BanUserForBlogUpdateModel, ownerBlogUserId: string) {
        const user = await this.usersRepository.getUserById(userId);
        if (!user) throw new NotFoundException();
        const blog = await this.bloggerRepository.getBlogById(updateModel.blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== ownerBlogUserId) {
            throw new ForbiddenException();
        }
        const banDate = new Date().toISOString();
        return this.bloggerRepository.banUserForBlog(userId, updateModel, banDate);
    }

    async deleteBlogByBlogId(blogId) {
        return await this.bloggerRepository.deleteBlogById(blogId);
    }
}
