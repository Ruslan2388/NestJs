import { IsNumber, IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogInputModelType {
    @Length(1, 15)
    @Transform(({ value }) => value?.trim())
    name: string;
    @Length(1, 500)
    description: string;
    @Length(1, 500)
    @IsUrl()
    websiteUrl: string;
}

export class UpdateBlogInputModelType {
    @Length(3, 15)
    @Transform(({ value }) => value?.trim())
    name: string;
    @Length(1, 500)
    description: string;
    @Length(1, 500)
    @IsUrl()
    websiteUrl: string;
}

function transformSortDirection(value: string): string {
    return value === 'asc' ? 'asc' : 'desc';
}

export class BlogQueryDto {
    @IsString()
    @IsOptional()
    public searchNameTerm = '';

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

    @Transform(({ value }) => transformSortDirection(value))
    @IsOptional()
    @IsString()
    public sortDirection = 'desc';
}
