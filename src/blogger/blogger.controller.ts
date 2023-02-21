import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BloggerService } from './blogger.service';
import { CreateBlogInputModelType, UpdateBlogInputModelType } from './BlogDto';
import { PostsService } from './post/posts.service';
import { CreatePostByBlogIdInputModelType, UpdatePostInputModelType } from '../postsQuery/PostDto';
import { UsersService } from '../superAdmin/users/users.service';
import { AccessTokenGuard } from '../guard/authMeGuard';
import { UserDecorator } from '../decorators/user-param.decorator';
import { User } from '../schemas/usersSchema';
import { BanUserForBlogUpdateModel, UserQueryDto } from '../superAdmin/users/UserDto';
import { CommentQueryDto } from '../comments/CommentsDto';
import { BlogQueryDto } from '../blogsQuery/BlogDto';
import { CommentsService } from '../comments/comments.service';
import { BlogsService } from '../blogsQuery/blogs.service';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './createBlogUseCase';
import { banUserForBlogCommand } from '../comments/useCases/banUserForBlogUseCases';
import { CreatePostByBlogIdCommand } from './post/postUseCases/createPostsByBlogIdUseCase';
import { DeleteBlogByBlogIdCommand } from './post/postUseCases/deleteBlogByBlogId';
import { UpdatePostByBlogCommand } from './post/postUseCases/updatePostByPostId';
import { DeletePostByBlogIdCommand } from './post/postUseCases/deletePostByBlogIdUseCase';

@Controller('blogger')
export class BloggerController {
    constructor(
        protected bloggerService: BloggerService,
        protected postsService: PostsService,
        protected commentsService: CommentsService,
        protected queryBloggerService: BlogsService,
        protected usersService: UsersService,
        private commandBus: CommandBus,
    ) {}

    @UseGuards(AccessTokenGuard)
    @Get('blogs')
    getBlogs(@Query() queryData: BlogQueryDto, @UserDecorator() user: User) {
        return this.bloggerService.getBlogger(queryData, user);
    }

    @UseGuards(AccessTokenGuard)
    @Get('blogs/comments')
    async getAllComments(@UserDecorator() user: User, @Query() queryData: CommentQueryDto) {
        return await this.commentsService.getAllComments(queryData, user.accountData.id);
    }

    @UseGuards(AccessTokenGuard)
    @Get('users/blog/:blogId')
    async getBannedUsers(@Param('blogId') blogId, @UserDecorator() user: User, @Query() queryData: UserQueryDto) {
        return this.usersService.getBannedUsersForBlog(queryData, blogId, user.accountData.id);
    }

    @Post('blogs')
    @UseGuards(AccessTokenGuard)
    createBlog(@Body() inputModel: CreateBlogInputModelType, @UserDecorator() user: User) {
        return this.commandBus.execute(new CreateBlogCommand(inputModel, user));
    }

    @Post('blogs/:blogId/posts')
    @UseGuards(AccessTokenGuard)
    async createPostsByBlogId(@Body() inputModel: CreatePostByBlogIdInputModelType, @Param('blogId') blogId: string, @UserDecorator() user: User) {
        return await this.commandBus.execute(new CreatePostByBlogIdCommand(inputModel, blogId, user));
    }

    @Put('blogs/:blogId')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async updateBlogByBlogId(@Param('blogId') blogId, @Body() updateModel: UpdateBlogInputModelType, @UserDecorator() user: User) {
        return await this.bloggerService.updateBlogByBlogId(blogId, updateModel, user);
    }

    @Put('blogs/:blogId/posts/:postId')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    updatePostByBlogId(@Param('blogId') blogId, @Param('postId') postId, @Body() updateModel: UpdatePostInputModelType, @UserDecorator() user: User) {
        return this.commandBus.execute(new UpdatePostByBlogCommand(blogId, postId, updateModel, user.accountData.id));
    }

    @Put('/users/:userId/ban')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async banUserForBlog(@Param('userId') userId, @Body() updateModel: BanUserForBlogUpdateModel, @UserDecorator() user: User) {
        return this.commandBus.execute(new banUserForBlogCommand(userId, updateModel, user.accountData.id));
    }

    @Delete('blogs/:blogId/posts/:postId')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async deletePostByBlogId(@Param('blogId') blogId, @Param('postId') postId, @UserDecorator() user: User) {
        return this.commandBus.execute(new DeletePostByBlogIdCommand(blogId, postId, user.accountData.id));
    }

    @Delete('blogs/:blogId')
    @HttpCode(204)
    @UseGuards(AccessTokenGuard)
    async deleteBlogByBlogId(@Param('blogId') blogId: string, @UserDecorator() user: User) {
        return this.commandBus.execute(new DeleteBlogByBlogIdCommand(blogId, user));
    }
}
