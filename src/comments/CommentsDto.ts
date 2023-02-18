import { Prop } from '@nestjs/mongoose';
import { IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformSortDirection } from '../blogsQuery/BlogDto';

export class CreateCommentsInputModel {
    @Length(20, 300)
    @Transform(({ value }) => value?.trim())
    content: string;
}
export class UpdateCommentsInputModel {
    @Length(20, 300)
    @Transform(({ value }) => value?.trim())
    content: string;
}

export class CommentQueryDto {
    @IsString()
    @IsOptional()
    public searchLoginTerm = '';

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
