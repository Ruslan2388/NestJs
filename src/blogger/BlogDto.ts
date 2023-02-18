import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Length } from 'class-validator';
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
