import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostInputModelType } from '../../../postsQuery/PostDto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../posts.repository';
import { BlogsRepository } from '../../../blogsQuery/blogs.repository';

export class UpdatePostByBlogCommand {
    constructor(public blogId: string, public postId: string, public updateModel: UpdatePostInputModelType, public userId: string) {}
}

@CommandHandler(UpdatePostByBlogCommand)
export class UpdatePostByBlogIdUseCase implements ICommandHandler<UpdatePostByBlogCommand> {
    constructor(protected postsRepository: PostsRepository, protected queryBlogsRepository: BlogsRepository) {}
    async execute(command: UpdatePostByBlogCommand) {
        const blog = await this.queryBlogsRepository.getBlogById(command.blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== command.userId) throw new ForbiddenException();
        const result = await this.postsRepository.updatePostByPostId(command.postId, command.updateModel, command.blogId);
        if (!result) throw new NotFoundException();
        return result;
    }
}
