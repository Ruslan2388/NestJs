import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../schemas/blogsSchema';
import { Model } from 'mongoose';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { BanUserForBlogUpdateModel } from '../superAdmin/users/UserDto';
import { CommentQueryDto } from '../comments/CommentsDto';

@Injectable()
export class BloggerRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
    async getBlogger(queryData, user): Promise<Blog[] | any> {
        const filter: any = { 'blogOwnerInfo.userLogin': user.accountData.login };
        if (queryData.searchNameTerm) {
            filter.name = { $regex: queryData.searchNameTerm, $options: 'i' };
        }
        const totalCount = await this.blogModel.countDocuments({
            'blogOwnerInfo.userLogin': user.accountData.login,
            name: {
                $regex: queryData.searchNameTerm,
                $options: 'i',
            },
        });
        const pagesCount = Number(Math.ceil(totalCount / queryData.pageSize));
        const page = Number(queryData.pageNumber);
        const pageSize = Number(queryData.pageSize);
        const items = (await this.blogModel
            .find(filter, { _id: 0, __v: 0, blogOwnerInfo: 0, banInfo: 0, bannedUsers: 0 })
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean()) as [];
        return { pagesCount, page, pageSize, totalCount, items };
    }

    async createBlog(newBlog: CreateBlogInputModelType) {
        try {
            return this.blogModel.create(newBlog);
        } catch (e) {
            return null;
        }
    }

    async updateBlogByBlogId(blogId: string, updateModel: UpdateBlogInputModelType) {
        const result = await this.blogModel.updateOne(
            { id: blogId },
            {
                name: updateModel.name,
                description: updateModel.description,
                websiteUrl: updateModel.websiteUrl,
            },
        );
        return result.matchedCount;
    }
    async deleteBlogById(blogId) {
        const result = await this.blogModel.deleteOne({ id: blogId });
        return result.deletedCount;
    }
    async deleteAllBlogs() {
        return this.blogModel.deleteMany({});
    }

    async banUserForBlog(userId: string, updateModel: BanUserForBlogUpdateModel) {
        if (updateModel.isBanned === false) return this.blogModel.updateOne({ id: updateModel.blogId }, { $pull: { bannedUsers: userId } });
        return this.blogModel.updateOne({ id: updateModel.blogId }, { $addToSet: { bannedUsers: userId } });
    }

    async checkUserOnBan(blogId: string, userId: string) {
        const blog = await this.blogModel.findOne({ id: blogId, bannedUsers: { $in: [userId] } }, { id: 1 });
        if (blog) return true;
        return false;
    }
}
