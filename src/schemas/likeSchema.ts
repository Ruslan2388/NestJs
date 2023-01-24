import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikeDocument = Document & Like;

@Schema()
export class Like {
    @Prop()
    parentId: string;
    @Prop()
    userId: string;
    @Prop()
    status: string;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
