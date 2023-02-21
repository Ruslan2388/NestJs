import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../../blogsQuery/blogs.repository';

export class DeletePostByBlogIdCommand {
    constructor(public blogId: string, public postId: string, public userId: string) {}
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogUseCase implements ICommandHandler<DeletePostByBlogIdCommand> {
    constructor(protected postsRepository: PostsRepository, protected queryBlogsRepository: BlogsRepository) {}
    async execute(command: DeletePostByBlogIdCommand) {
        const blog = await this.queryBlogsRepository.getBlogById(command.blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== command.userId) throw new ForbiddenException();
        const result = await this.postsRepository.deletePostByBlogId(command.postId);
        if (!result) throw new NotFoundException();
        return result;
    }
}
