import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
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
}

export const UserSchema = SchemaFactory.createForClass(User);
