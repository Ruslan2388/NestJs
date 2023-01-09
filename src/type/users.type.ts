export type CreateUserInputModelType = {
    login: string;
    password: string;
    email: string;
};
export type UsersPaginationQueryType = {
    searchLoginTerm: string;
    searchEmailTerm: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
};
