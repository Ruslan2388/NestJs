import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../../schemas/blogsSchema';
import { Model } from 'mongoose';
import { BanBlogUpdateModel } from './superAdminBlogDTO';

@Injectable()
export class BlogsSARepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

    async getBlogsSa(queryData) {
        const filter: any = {};
        if (queryData.searchNameTerm) {
            filter.name = { $regex: queryData.searchNameTerm, $options: 'i' };
        }
        const totalCount = await this.blogModel.countDocuments({
            name: {
                $regex: queryData.searchNameTerm,
                $options: 'i',
            },
        });
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize));
        const page = Number(queryData.pageNumber);
        const pageSize = Number(queryData.pageSize);
        const items = (await this.blogModel
            .find(filter, { _id: 0, __v: 0 })
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean()) as [];
        return { pagesCount, page, pageSize, totalCount, items };
    }

    async bindBlogWithUser(blogId: string, userId: string, login: string) {
        return this.blogModel.updateOne({ id: blogId }, { 'blogOwnerInfo.userId': userId, 'blogOwnerInfo.login': login });
    }

    async banBlog(blogId: string, updateModel: BanBlogUpdateModel) {
        console.log('sds');
        return this.blogModel.updateOne({ id: blogId }, { isBanned: updateModel.isBanned });
    }
}
