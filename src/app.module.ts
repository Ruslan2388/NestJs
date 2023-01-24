import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { UsersController } from './users/users.controller';
import { BlogsController } from './blogs/blogs.controller';
import { DeleteAllController } from './DeleteALl/DeleteAll.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { BlogsService } from './blogs/blogs.service';
import { UsersRepository } from './users/users.repository';
import { BlogsRepository } from './blogs/blogs.repository';
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

const validators = [IsLoginInDB, IsEmailInInDB, ResendEmailValidator];
const services = [AppService, UsersService, BlogsService, PostsService, AuthService, JwtService, EmailService, CommentsService];

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
    controllers: [AppController, UsersController, BlogsController, DeleteAllController, PostsController, AuthController, CommentsController],
    providers: [...services, PostsRepository, UsersRepository, BlogsRepository, AuthRepository, CommentsRepository, ...validators],
})
export class AppModule {}
