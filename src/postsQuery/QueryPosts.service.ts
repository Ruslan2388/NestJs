import { Injectable, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from 'src/blogger/blogger.repository';
import { QueryPostsRepository } from './QueryPosts.repository';
import { Post } from '../schemas/postsSchema';

@Injectable()
export class QueryPostsService {
    constructor(protected queryPostsRepository: QueryPostsRepository, protected blogsRepository: BloggerRepository) {}
    getPosts(queryData, userId) {
        return this.queryPostsRepository.getPosts(queryData, userId);
    }
    async getPostById(postId: string, userId: string | null): Promise<Post | null> {
        const post = await this.queryPostsRepository.getPostsById(postId, userId);
        if (!post) throw new NotFoundException();
        return post;
    }

    async createLikeByPost(postId, userId: string, likeStatus: string, login: string) {
        const createdAt = new Date().toISOString();
        return this.queryPostsRepository.createLikeByPost(postId, userId, likeStatus, login, createdAt);
    }
}
