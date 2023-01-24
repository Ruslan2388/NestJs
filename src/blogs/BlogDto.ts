import { IsUrl, Length } from 'class-validator';
import { Exclude } from 'class-transformer';

export class CreateBlogInputModelType {
    @Length(3, 15)
    @Exclude()
    name: string;
    @Length(1, 500)
    description: string;
    @Length(1, 500)
    @IsUrl()
    websiteUrl: string;
}

export class UpdateBlogInputModelType {
    @Length(3, 15)
    @Exclude()
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
