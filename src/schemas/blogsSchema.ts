import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = Blog & Document;

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
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
