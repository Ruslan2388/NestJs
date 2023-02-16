import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostInputModelType {
    @Length(3, 30)
    @Transform(({ value }) => value?.trim())
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    @Transform(({ value }) => value?.trim())
    content: string;
    @Length(1, 30)
    blogId: string;
}

export class CreatePostByBlogIdInputModelType {
    @Length(3, 30)
    @Transform(({ value }) => value?.trim())
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    @Transform(({ value }) => value?.trim())
    content: string;
}

export class UpdatePostInputModelType {
    @Length(3, 30)
    @Transform(({ value }) => value?.trim())
    title: string;
    @Length(1, 100)
    shortDescription: string;
    @Length(1, 1000)
    @Transform(({ value }) => value?.trim())
    content: string;
    @Length(1, 30)
    @IsOptional()
    blogId: string;
}

export class PostQueryDto {
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    public pageNumber = 1;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    public pageSize = 10;

    @IsString()
    @IsOptional()
    public sortBy = 'createdAt';

    @IsString()
    @IsOptional()
    public sortDirection = 'desc';
}
