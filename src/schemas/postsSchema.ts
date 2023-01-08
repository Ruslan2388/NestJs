import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PostDocument = Post & Document;

class extendedLikesInfo {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'Like' | 'Dislike' | 'None';
    newestLikes: [addedAt: string, userId: string, login: string];
}

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
    @Prop()
    blogName: string;
    @Prop()
    createdAt: string;
    @Prop()
    extendedLikesInfo: extendedLikesInfo;
}

export const PostScheme = SchemaFactory.createForClass(Post);
