import { IsBoolean, IsEmail } from 'class-validator';

export class BanBlogUpdateModel {
    @IsBoolean({ message: 'IsBoolean' })
    isBanned: boolean;
}
