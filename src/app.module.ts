import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { BloggerController } from './blogger/blogger.controller';
import { DeleteAllController } from './DeleteALl/DeleteAll.controller';
import { QueryPostsController } from './postsQuery/QueryPosts.controller';
import { CommentsController } from './comments/comments.controller';
import { DevicesController } from './devices/devices.controller';
import { SuperAdminController } from './superAdmin/superAdmin.controller.';
import { AuthController } from './auth/auth.controller';
import { BlogsController } from './blogsQuery/blogs.controller';

import { AppService } from './app.service';
import { CommentsService } from './comments/comments.service';
import { UsersService } from './superAdmin/users/users.service';
import { BloggerService } from './blogger/blogger.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './helper/email.service';
import { PostsService } from './blogger/post/posts.service';
import { DevicesService } from './devices/devices.service';
import { BlogsSAService } from './superAdmin/blogs/blogs-SA.service';
import { BlogsService } from './blogsQuery/blogs.service';
import { QueryPostsService } from './postsQuery/QueryPosts.service';

import { UsersRepository } from './superAdmin/users/users.repository';
import { BloggerRepository } from './blogger/blogger.repository';
import { AuthRepository } from './auth/auth.repository';
import { CommentsRepository } from './comments/comments.repository';
import { PostsRepository } from './blogger/post/posts.repository';
import { DevicesRepository } from './devices/devices.repository';
import { BlogsSARepository } from './superAdmin/blogs/blogs-SA.repository';
import { QueryPostsRepository } from './postsQuery/QueryPosts.repository';
import { BlogsRepository } from './blogsQuery/blogs.repository';

import { User, UserSchema } from './schemas/usersSchema';
import { Blog, BlogSchema } from './schemas/blogsSchema';
import { Post, PostScheme } from './schemas/postsSchema';
import { Device, DeviceSchema } from './schemas/deviceSchema';
import { Comments, CommentsSchema } from './schemas/commentsSchema';
import { Like, LikeSchema } from './schemas/likeSchema';

import { IsEmailInInDB, IsLoginInDB } from './validator/registerValidator';
import { ResendEmailValidator } from './validator/resendEmailValidator';
import { getMailConfig } from './helper/mail.config';
import { CreateCommentForPostIdUseCase } from './comments/useCases/createCommentForPostIdUseCase';
import { CreateBlogCommandUseCase } from './blogger/createBlogUseCase';
import { banUserForBlogUseCase } from './comments/useCases/banUserForBlogUseCases';
import { DeleteBlogByBlogIdUseCase } from './blogger/post/postUseCases/deleteBlogByBlogId';
import { CreatePostByBlogIdUseCase } from './blogger/post/postUseCases/createPostsByBlogIdUseCase';
import { UpdatePostByBlogIdUseCase } from './blogger/post/postUseCases/updatePostByPostId';
import { DeletePostByBlogUseCase } from './blogger/post/postUseCases/deletePostByBlogIdUseCase';

const validators = [IsLoginInDB, IsEmailInInDB, ResendEmailValidator];
const useCases = [
    CreateCommentForPostIdUseCase,
    CreateBlogCommandUseCase,
    banUserForBlogUseCase,
    CreatePostByBlogIdUseCase,
    DeleteBlogByBlogIdUseCase,
    UpdatePostByBlogIdUseCase,
    DeletePostByBlogUseCase,
];
const services = [
    AppService,
    UsersService,
    BloggerService,
    PostsService,
    AuthService,
    JwtService,
    EmailService,
    CommentsService,
    DevicesService,
    BlogsSAService,
    BlogsService,
    QueryPostsService,
];

@Module({
    imports: [
        CqrsModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMailConfig,
        }),
        ThrottlerModule.forRoot({
            ttl: 10,
            limit: 8,
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URI),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Blog.name, schema: BlogSchema },
            { name: Post.name, schema: PostScheme },
            { name: Device.name, schema: DeviceSchema },
            { name: Comments.name, schema: CommentsSchema },
            { name: Like.name, schema: LikeSchema },
        ]),
    ],
    controllers: [
        AppController,
        BlogsController,
        BloggerController,
        DeleteAllController,
        QueryPostsController,
        AuthController,
        CommentsController,
        DevicesController,
        SuperAdminController,
    ],
    providers: [
        ...useCases,
        ...services,
        PostsRepository,
        UsersRepository,
        BloggerRepository,
        AuthRepository,
        CommentsRepository,
        DevicesRepository,
        BlogsSARepository,
        BlogsRepository,
        QueryPostsRepository,
        ...validators,
    ],
})
export class AppModule {}
