import { IsEnum, Length } from 'class-validator';

export class LikeInputModel {
    @Length(1)
    @IsEnum(['Like', 'Dislike', 'None'])
    likeStatus: string;
}
