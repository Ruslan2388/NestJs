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
    async getBlogs(): Promise<Blog[]> {
        const blogs = await this.blogModel.find({}, { _id: 0, __v: 0 });
        return blogs;
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
        return this.blogModel.updateOne(
            { id: blogId },
            {
                name: updateModel.name,
                description: updateModel.description,
                websiteUrl: updateModel.websiteUrl,
            },
        );
    }
    async deleteBlogById(blogId) {
        return this.blogModel.deleteOne({ id: blogId });
    }
    async deleteAllBlogs() {
        return this.blogModel.deleteMany({});
    }
}
