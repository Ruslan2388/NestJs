import { IsUrl, Length } from 'class-validator';

export class CreateBlogInputModelType {
    @Length(3, 15)
    name: string;
    @Length(1, 500)
    description: string;
    @Length(1, 500)
    @IsUrl()
    websiteUrl: string;
}

export class UpdateBlogInputModelType {
    @Length(3, 15)
    name: string;
    @Length(1, 500)
    description: string;
    @Length(1, 500)
    @IsUrl()
    websiteUrl: string;
}

export type BlogPaginationQueryType = {
    searchNameTerm: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc'; //todo Enum
};
