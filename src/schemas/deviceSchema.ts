import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceDocument = Device & Document;

@Schema()
export class Device {
    @Prop()
    userId: string;
    @Prop()
    title: string;
    @Prop()
    lastActiveDate: string;
    @Prop()
    exp: string;
    @Prop()
    ip: string;
    @Prop()
    deviceId: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
