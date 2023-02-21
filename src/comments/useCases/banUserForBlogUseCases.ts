import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../superAdmin/users/users.repository';
import { BloggerRepository } from '../../blogger/blogger.repository';
import { BanUserForBlogUpdateModel } from '../../superAdmin/users/UserDto';

export class banUserForBlogCommand {
    constructor(public userId: string, public updateModel: BanUserForBlogUpdateModel, public ownerBlogUserId: string) {}
}

@CommandHandler(banUserForBlogCommand)
export class banUserForBlogUseCase implements ICommandHandler<banUserForBlogCommand> {
    constructor(private usersRepository: UsersRepository, private bloggerRepository: BloggerRepository) {}
    async execute(command: banUserForBlogCommand) {
        const user = await this.usersRepository.getUserById(command.userId);
        if (!user) throw new NotFoundException();
        const blog = await this.bloggerRepository.getBlogById(command.updateModel.blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== command.ownerBlogUserId) {
            throw new ForbiddenException();
        }
        const banDate = new Date().toISOString();
        return this.bloggerRepository.banUserForBlog(command.userId, command.updateModel, banDate);
    }
}
