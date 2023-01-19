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

const validators = [IsLoginInDB, IsEmailInInDB];
const services = [AppService, UsersService, BlogsService, PostsService, AuthService, JwtService, EmailService];

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMailConfig,
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRoot(process.env.MONGO_URI),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Blog.name, schema: BlogSchema },
            { name: Post.name, schema: PostScheme },
            { name: Device.name, schema: DeviceSchema },
        ]),
    ],
    controllers: [AppController, UsersController, BlogsController, DeleteAllController, PostsController, AuthController],
    providers: [...services, PostsRepository, UsersRepository, BlogsRepository, AuthRepository, ...validators],
})
export class AppModule {}
