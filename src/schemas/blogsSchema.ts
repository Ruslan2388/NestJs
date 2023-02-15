import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = Blog & Document;

class blogOwnerInfo {
    userId: string;
    userLogin: string;
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
    blogOwnerInfo: blogOwnerInfo;
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
