import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostByBlogIdInputModelType } from '../../../postsQuery/PostDto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../../blogsQuery/blogs.repository';
import { PostsRepository } from '../posts.repository';
import { BloggerRepository } from '../../blogger.repository';

export class CreatePostByBlogIdCommand {
    constructor(public inputModel: CreatePostByBlogIdInputModelType, public blogId: string, public user) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase implements ICommandHandler<CreatePostByBlogIdCommand> {
    constructor(protected bloggerRepository: BloggerRepository, protected postsRepository: PostsRepository) {}
    async execute(command: CreatePostByBlogIdCommand) {
        const blog = await this.bloggerRepository.getBlogById(command.blogId);
        console.log(blog);
        if (blog.blogOwnerInfo.userLogin !== command.user.accountData.login) throw new ForbiddenException();

        if (!blog) {
            throw new NotFoundException();
        }
        if (blog) {
            const newPost = {
                id: new Date().valueOf().toString(),
                title: command.inputModel.title,
                shortDescription: command.inputModel.shortDescription,
                content: command.inputModel.content,
                blogId: command.blogId,
                userId: command.user.accountData.id,
                blogName: blog.name,
                createdAt: new Date().toISOString(),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: [],
                },
            };
            const result = this.postsRepository.createPost(newPost);

            if (!result) throw new BadRequestException([{ message: 'Bad', field: 'NotCreatePost' }]);
            return {
                id: newPost.id,
                title: newPost.title,
                shortDescription: newPost.shortDescription,
                content: newPost.content,
                blogId: newPost.blogId,
                blogName: newPost.blogName,
                createdAt: newPost.createdAt,
                extendedLikesInfo: {
                    likesCount: newPost.extendedLikesInfo.likesCount,
                    dislikesCount: newPost.extendedLikesInfo.dislikesCount,
                    myStatus: newPost.extendedLikesInfo.myStatus,
                    newestLikes: [],
                },
            };
        }
        throw new NotFoundException();
    }
}
