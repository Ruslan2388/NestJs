import { Injectable } from '@nestjs/common';
import { BlogsSARepository } from './blogs-SA.repository';
import { BanBlogUpdateModel } from './superAdminBlogDTO';

@Injectable()
export class BlogsSAService {
    constructor(protected blogsSaRepository: BlogsSARepository) {}

    async getBlogsSa(queryData) {
        return this.blogsSaRepository.getBlogsSa(queryData);
    }

    async bindBlogWithUser(blogId: string, userId: string, login: string) {
        return await this.blogsSaRepository.bindBlogWithUser(blogId, userId, login);
    }

    async banBlog(blogId: string, updateModel: BanBlogUpdateModel) {
        return await this.blogsSaRepository.banBlog(blogId, updateModel);
    }
}
