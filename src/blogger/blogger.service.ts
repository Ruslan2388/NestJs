import { BloggerRepository } from './blogger.repository';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateBlogInputModelType } from './BlogDto';

@Injectable()
export class BloggerService {
    constructor(protected bloggerRepository: BloggerRepository) {}

    async getBlogger(queryData, user) {
        return this.bloggerRepository.getBlogger(queryData, user);
    }
    async getBlogById(blogId) {
        return this.bloggerRepository.getBlogById(blogId);
    }

    async updateBlogByBlogId(blogId: string, updateModel: UpdateBlogInputModelType, user) {
        const blog = await this.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userLogin !== user.accountData.login) throw new ForbiddenException();
        const result = await this.bloggerRepository.updateBlogByBlogId(blogId, updateModel);
        if (!result) throw new NotFoundException();
        return result;
    }
}
