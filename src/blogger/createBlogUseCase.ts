import { CreateBlogInputModelType } from './BlogDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { BloggerRepository } from './blogger.repository';

export class CreateBlogCommand {
    constructor(public inputModel: CreateBlogInputModelType, public user) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandUseCase implements ICommandHandler<CreateBlogCommand> {
    constructor(private bloggerRepository: BloggerRepository) {}
    async execute(command: CreateBlogCommand) {
        const newBlog = {
            id: new Date().valueOf().toString(),
            name: command.inputModel.name,
            description: command.inputModel.description,
            websiteUrl: command.inputModel.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
            blogOwnerInfo: {
                userId: command.user.accountData.id,
                userLogin: command.user.accountData.login,
            },
            banInfo: {
                isBanned: false,
                banDate: null,
            },
        };
        const result = await this.bloggerRepository.createBlog(newBlog);
        if (!result) throw new BadRequestException([{ message: 'Bad', field: 'CantCreateBlog' }]);
        return {
            id: newBlog.id,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership,
        };
    }
}
