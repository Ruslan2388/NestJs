import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../helper/email.service';
import { BloggerRepository } from '../../blogger/blogger.repository';

@Injectable()
export class UsersService {
    constructor(protected usersRepository: UsersRepository, protected jwtService: JwtService, protected bloggerRepository: BloggerRepository) {}

    async getUsers(queryData) {
        return await this.usersRepository.getUsers(queryData);
    }

    async getUserById(userId) {
        const user = await this.usersRepository.getUserById(userId);
        if (!user) throw new NotFoundException();
        return user;
    }

    async getUserByIdAc(userId) {
        const user = await this.usersRepository.getUserById(userId);
        if (!user) throw new UnauthorizedException();
        return user;
    }

    async getUserByLoginOrEmail(loginOrEmail: string) {
        const user = await this.usersRepository.getUserByLoginOrEmail(loginOrEmail);
        if (!user || user.accountData.banInfo.isBanned === true) throw new UnauthorizedException();
        return user;
    }

    async getUserIdByAccessToken(token: string) {
        try {
            const result: any = this.jwtService.verify(token, { secret: 'SecretKey' });
            return result.userId;
        } catch (error) {
            return null;
        }
    }

    async getBannedUsersForBlog(queryData, blogId: string, userId: string) {
        const blog = await this.bloggerRepository.getBlogById(blogId);
        if (!blog) throw new NotFoundException();
        if (blog.blogOwnerInfo.userId !== userId) {
            throw new ForbiddenException();
        }
        return this.usersRepository.getBannedUsersForBlog(queryData, blogId);
    }

    async deleteUserById(userId: string) {
        return this.usersRepository.deleteUserById(userId);
    }

    async banUser(userId: number, isBanned: boolean, banReason: string) {
        const banDate = new Date().toISOString();
        return this.usersRepository.banUser(userId, isBanned, banReason, banDate);
    }
}
