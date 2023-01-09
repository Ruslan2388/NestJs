import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blogsSchema';
import { Model } from 'mongoose';
import { CreateBlogInputModelType } from '../type/blogs.type';

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    ) {}
    async getBlogs(queryData): Promise<Blog[] | any> {
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

    async getBlogById(blogId): Promise<Blog> | null {
        const blog = await this.blogModel.findOne(
            { id: blogId },
            { _id: 0, __v: 0 },
        );
        return blog;
    }

    async createBlog(newBlog: CreateBlogInputModelType) {
        try {
            return this.blogModel.create(newBlog);
        } catch (e) {
            return null;
        }
    }

    async updateBlogByBlogId(
        blogId: string,
        updateModel: CreateBlogInputModelType,
    ) {
        const result = await this.blogModel.updateOne(
            { id: blogId },
            {
                name: updateModel.name,
                description: updateModel.description,
                websiteUrl: updateModel.websiteUrl,
            },
        );
        return result.modifiedCount;
    }
    async deleteBlogById(blogId) {
        const result = await this.blogModel.deleteOne({ id: blogId });
        return result.deletedCount;
    }
    async deleteAllBlogs() {
        return this.blogModel.deleteMany({});
    }
}
