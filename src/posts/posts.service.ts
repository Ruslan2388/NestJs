import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from '../schemas/postsSchema';

@Injectable()
export class PostsService {
    constructor(protected postsRepository: PostsRepository) {}
    getPosts() {
        return this.postsRepository.getPosts();
    }
    getPostById(postId: string): Promise<Post | null> {
        return this.postsRepository.getPostsById(postId);
    }

    async deletePostById(postId: string) {
        return this.postsRepository.deletePostById(postId);
    }
}
