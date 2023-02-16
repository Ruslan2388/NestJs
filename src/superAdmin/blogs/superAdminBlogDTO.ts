import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class BanBlogUpdateModel {
    @IsBoolean({ message: 'IsBoolean' })
    isBanned: boolean;
}
