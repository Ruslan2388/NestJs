import { Controller, Delete, HttpCode } from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';
import { UsersRepository } from '../users/users.repository';
import { BlogsRepository } from '../blogs/blogs.repository';
import { PostsRepository } from '../posts/posts.repository';

@Controller('testing/all-data')
export class DeleteAllController {
    constructor(
        protected usersRepository: UsersRepository,
        protected blogsRepository: BlogsRepository,
        protected postsRepository: PostsRepository,
    ) {}

    @Delete()
    @HttpCode(204)
    async deleteAllUsers() {
        await this.postsRepository.deleteAllPosts();
        await this.usersRepository.deleteAllUsers();
        await this.blogsRepository.deleteAllBlogs();
    }
}
