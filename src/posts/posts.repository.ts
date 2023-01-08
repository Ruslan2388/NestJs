import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../schemas/postsSchema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    ) {}
    async getPosts(): Promise<Post[]> {
        return this.PostModel.find({}, { _id: 0, __v: 0 });
    }

    async getPostsById(postId: string): Promise<Post | null> {
        return this.PostModel.findOne({ id: postId }, { _id: 0, __v: 0 });
    }
    async getPostsByBlogId(blogId: string) {
        return this.PostModel.find({ blogId: blogId }, { _id: 0, __v: 0 });
    }
    async createPost(newPost): Promise<Post | null> {
        try {
            return this.PostModel.create(newPost);
        } catch (e) {
            return null;
        }
    }
    // update
    async deletePostById(postId: string): Promise<number> {
        const result = await this.PostModel.deleteOne({ id: postId });
        return result.deletedCount;
    }

    async deleteAllPosts() {
        return this.PostModel.deleteMany({});
    }
}
