import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blogsSchema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
    async getBlogs(queryData): Promise<Blog[] | any> {
        const bannedBlog = await this.blogModel.distinct('id', { 'banInfo.isBanned': true });
        const filter: any = { id: { $nin: bannedBlog } };
        if (queryData.searchNameTerm) {
            filter.name = { $regex: queryData.searchNameTerm, $options: 'i' };
        }
        const totalCount = await this.blogModel.countDocuments({
            id: { $nin: bannedBlog },
            name: {
                $regex: queryData.searchNameTerm,
                $options: 'i',
            },
        });
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize));
        const page = Number(queryData.pageNumber);
        const pageSize = Number(queryData.pageSize);
        const items = (await this.blogModel
            .find(filter, { _id: 0, __v: 0, blogOwnerInfo: 0, isBanned: 0 })
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean()) as [];
        return { pagesCount, page, pageSize, totalCount, items };
    }

    async getBlogById(blogId): Promise<Blog> | null {
        const bannedBlog = await this.blogModel.distinct('id', { 'banInfo.isBanned': true });
        const blog = await this.blogModel.findOne({ $and: [{ id: blogId }, { id: { $nin: bannedBlog } }] }, { _id: 0, __v: 0, blogOwnerInfo: 0, banInfo: 0 });
        return blog;
    }
}
