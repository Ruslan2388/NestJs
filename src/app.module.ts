import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
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

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Blog.name, schema: BlogSchema },
            { name: Post.name, schema: PostScheme },
        ]),
    ],
    controllers: [
        AppController,
        UsersController,
        BlogsController,
        DeleteAllController,
        PostsController,
    ],
    providers: [
        AppService,
        UsersService,
        UsersRepository,
        BlogsService,
        BlogsRepository,
        PostsService,
        PostsRepository,
    ],
})
export class AppModule {}
