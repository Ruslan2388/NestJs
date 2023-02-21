import { User } from '../../schemas/usersSchema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QueryPostsRepository } from '../../postsQuery/QueryPosts.repository';
import { BloggerRepository } from '../../blogger/blogger.repository';
import { CommentsRepository } from '../comments.repository';

export class CreateCommentsForPostIdCommand {
    constructor(public content: string, public postId: string, public user: User) {}
}

@CommandHandler(CreateCommentsForPostIdCommand)
export class CreateCommentForPostIdUseCase implements ICommandHandler<CreateCommentsForPostIdCommand> {
    constructor(private queryPostsRepository: QueryPostsRepository, private bloggerRepository: BloggerRepository, private commentsRepository: CommentsRepository) {}
    async execute(command: CreateCommentsForPostIdCommand) {
        console.log('sadasdasd');
        const post = await this.queryPostsRepository.getPostsById(command.postId, command.user.accountData.id);
        if (!post) throw new NotFoundException();

        const blog = await this.bloggerRepository.checkUserOnBan(post.blogId, command.user.accountData.id);
        if (blog) throw new ForbiddenException();
        const newComment = {
            id: (+new Date()).toString(),
            content: command.content,
            commentatorInfo: {
                userId: command.user.accountData.id,
                userLogin: command.user.accountData.login,
            },
            parentId: command.postId,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
            },
            createdAt: new Date().toISOString(),
            postInfo: { id: post.id, title: post.title, blogId: post.blogId, blogName: post.blogName },
        };
        await this.commentsRepository.createComments(newComment);
        delete newComment.parentId;
        delete newComment.postInfo;
        return newComment;
    }
}
