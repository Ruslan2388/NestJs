import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDate } from 'class-validator';

export type UserDocument = User & Document;

class BanInfo {
    isBanned: boolean;
    banDate: string;
    banReason: string;
}
class BlogBanInfo {
    isBanned: string;
    banReason: string;
    blogId: string;
    banDate: string;
}

class AccountData {
    @Prop()
    id: string;
    @Prop({ type: String })
    login: string;
    @Prop()
    password: string;
    @Prop()
    email: string;
    @Prop()
    createdAt: string;
    @Prop()
    banInfo: BanInfo;
    @Prop()
    blogBanInfo: BlogBanInfo;
}
class EmailConfirmation {
    @Prop()
    confirmationCode: string;
    @Prop()
    expirationData: string;
    @Prop()
    @IsDate()
    recoveryCode: Date;
    @Prop()
    isConfirmed: boolean;
}

@Schema()
export class User {
    @Prop()
    accountData: AccountData;
    @Prop()
    emailConfirmation: EmailConfirmation;
}

export const UserSchema = SchemaFactory.createForClass(User);
