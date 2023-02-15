import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { BloggerController } from './blogger/blogger.controller';
import { DeleteAllController } from './DeleteALl/DeleteAll.controller';
import { AppService } from './app.service';
import { UsersService } from './superAdmin/users/users.service';
import { BloggerService } from './blogger/blogger.service';
import { UsersRepository } from './superAdmin/users/users.repository';
import { BloggerRepository } from './blogger/blogger.repository';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { User, UserSchema } from './schemas/usersSchema';
import { Blog, BlogSchema } from './schemas/blogsSchema';
import { Post, PostScheme } from './schemas/postsSchema';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthRepository } from './auth/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { Device, DeviceSchema } from './schemas/deviceSchema';
import { IsEmailInInDB, IsLoginInDB } from './validator/registerValidator';
import { EmailService } from './helper/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { getMailConfig } from './helper/mail.config';
import { ResendEmailValidator } from './validator/resendEmailValidator';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommentsController } from './comments/comments.controller';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsService } from './comments/comments.service';
import { Comments, CommentsSchema } from './schemas/commentsSchema';
import { Like, LikeSchema } from './schemas/likeSchema';
import { DevicesService } from './devices/devices.service';
import { DevicesRepository } from './devices/devices.repository';
import { DevicesController } from './devices/devices.controller';
import { SuperAdminController } from './superAdmin/superAdmin.controller.';
import { BlogsSAService } from './superAdmin/blogs/blogs-SA.service';
import { BlogsSARepository } from './superAdmin/blogs/blogs-SA.repository';
import { BlogsController } from './blogsQuery/blogs.controller';
import { BlogsService } from './blogsQuery/blogs.service';
import { BlogsRepository } from './blogsQuery/blogs.repository';
import { IsUserBan } from './validator/logiinValidators';

const validators = [IsLoginInDB, IsEmailInInDB, ResendEmailValidator, IsUserBan];
const services = [AppService, UsersService, BloggerService, PostsService, AuthService, JwtService, EmailService, CommentsService, DevicesService, BlogsSAService, BlogsService];

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMailConfig,
        }),
        ThrottlerModule.forRoot({
            ttl: 10,
            limit: 5,
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
        PostsController,
        AuthController,
        CommentsController,
        DevicesController,
        SuperAdminController,
    ],
    providers: [
        ...services,
        PostsRepository,
        UsersRepository,
        BloggerRepository,
        AuthRepository,
        CommentsRepository,
        DevicesRepository,
        BlogsSARepository,
        BlogsRepository,
        ...validators,
    ],
})
export class AppModule {}
