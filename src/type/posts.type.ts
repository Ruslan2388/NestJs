export type CreatePostInputModelType = {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
};
export type PostPaginationQueryType = {
    searchNameTerm: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
};
