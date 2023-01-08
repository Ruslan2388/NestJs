import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Post {
    @Prop()
    id: string;
    @Prop()
    title: string;
    @Prop()
    shortDescription: string;
    @Prop()
    content: string;
    @Prop()
    blogId: string;
}

export const PostScheme = SchemaFactory.createForClass(Post);
