export type CreateBlogInputModelType = {
    name: string;
    description: string;
    websiteUrl: string;
};
export type BlogPaginationQueryType = {
    searchNameTerm: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc'; //todo Enum
};
