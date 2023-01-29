import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentsDocument = Document & Comments;

class likesInfo {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'Like' | 'Dislike' | 'None';
}
class commentatorInfo {
    userId: string;
    login: string;
}

@Schema()
export class Comments {
    @Prop()
    id: string;
    @Prop()
    content: string;
    @Prop()
    parentId: string;
    @Prop()
    createdAt: string;
    @Prop()
    commentatorInfo: commentatorInfo;
    @Prop()
    likesInfo: likesInfo;
}
export const CommentsSchema = SchemaFactory.createForClass(Comments);
