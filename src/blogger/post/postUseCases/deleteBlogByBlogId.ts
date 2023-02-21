import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BloggerRepository } from '../../blogger.repository';
import { BloggerService } from '../../blogger.service';

export class DeleteBlogByBlogIdCommand {
    constructor(public blogId: string, public user) {}
}

@CommandHandler(DeleteBlogByBlogIdCommand)
export class DeleteBlogByBlogIdUseCase implements ICommandHandler<DeleteBlogByBlogIdCommand> {
    constructor(private bloggerRepository: BloggerRepository, protected bloggerService: BloggerService) {}
    async execute(command: DeleteBlogByBlogIdCommand) {
        const blog = await this.bloggerService.getBlogById(command.blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException();
        return await this.bloggerRepository.deleteBlogById(command.blogId);
    }
}
