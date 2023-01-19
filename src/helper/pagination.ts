import { PostPaginationQueryType } from '../posts/PostDto';
import { UsersPaginationQueryType } from '../users/UserDto';
import { BlogPaginationQueryType } from '../blogs/BlogDto';
import { Prop } from '@nestjs/mongoose';

export const getPostPaginationData = (query: any): PostPaginationQueryType => {
    const searchNameTerm = query.searchNameTerm ? query.searchNameTerm : '';
    const pageSize = isNaN(query.pageSize) ? 10 : query.pageSize;
    const pageNumber = isNaN(query.pageNumber) ? 1 : query.pageNumber;
    const sortBy = query.sortBy === 'blogName' ? 'blogName' : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection };
};

export const UsersPaginationData = (query: any): UsersPaginationQueryType => {
    const searchLoginTerm = query.searchLoginTerm ? query.searchLoginTerm : '';
    const searchEmailTerm = query.searchEmailTerm ? query.searchEmailTerm : '';
    const pageSize = isNaN(query.pageSize) ? 10 : query.pageSize;
    const pageNumber = isNaN(query.pageNumber) ? 1 : query.pageNumber;
    const sortBy = query.sortBy === 'login' ? 'login' : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return {
        searchLoginTerm,
        searchEmailTerm,
        pageSize,
        pageNumber,
        sortBy,
        sortDirection,
    };
};
export const BlogPaginationData = (query: any): BlogPaginationQueryType => {
    const searchNameTerm = query.searchNameTerm ? query.searchNameTerm : '';
    const pageSize = isNaN(query.pageSize) ? 10 : query.pageSize;
    const pageNumber = isNaN(query.pageNumber) ? 1 : query.pageNumber;
    const sortBy = query.sortBy === 'name' ? 'name' : 'createdAt';
    const sortDirection = query.sortDirection === 'asc' ? 'asc' : 'desc';
    return { searchNameTerm, pageSize, pageNumber, sortBy, sortDirection };
};
export type UserResponseType = {
    id: string;
    login: string;
    email: string;
    createdAt: string;
};
