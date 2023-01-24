import { Length } from 'class-validator';

export class CreatePostInputModelType {
    @Length(3, 30)
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    content: string;
    @Length(1, 30)
    blogId: string;
}

export class CreatePostByBlogIdInputModelType {
    @Length(3, 30)
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    content: string;
}

export class UpdatePostInputModelType {
    @Length(3, 30)
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    content: string;
    @Length(1, 30)
    blogId: string;
}

export class UpdatePostByBlogIdInputModelType {
    @Length(3, 30)
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    content: string;
    @Length(1, 30)
    blogId: string;
}

export type PostPaginationQueryType = {
    searchNameTerm: string;
    pageSize: number;
    pageNumber: number;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
};
