import { PostPaginationQueryType } from '../type/posts.type';
import { UsersPaginationQueryType } from '../type/users.type';

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
