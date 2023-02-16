import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = Blog & Document;

class BlogOwnerInfo {
    userId: string;
    userLogin: string;
}

class BanInfo {
    isBanned: boolean;
    banDate: string;
}

@Schema()
export class Blog {
    @Prop()
    id: string;
    @Prop()
    name: string;
    @Prop()
    description: string;
    @Prop()
    websiteUrl: string;
    @Prop()
    createdAt: string;
    @Prop()
    isMembership: boolean;
    @Prop()
    blogOwnerInfo: BlogOwnerInfo;
    @Prop()
    banInfo: BanInfo;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
