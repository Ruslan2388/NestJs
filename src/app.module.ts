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
import { User, UserSchema } from './schemas/usersSchema';
import { Blog, BlogSchema } from './schemas/blogsSchema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Blog.name, schema: BlogSchema },
        ]),
    ],
    controllers: [
        AppController,
        UsersController,
        BlogsController,
        DeleteAllController,
    ],
    providers: [
        AppService,
        UsersService,
        UsersRepository,
        BlogsService,
        BlogsRepository,
    ],
})
export class AppModule {}
