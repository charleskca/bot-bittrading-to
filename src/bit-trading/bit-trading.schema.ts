import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Player extends Document {
  @Prop({ unique: true, index: true, default: uuidv4 })
  uuid: string;

  @Prop({ index: true })
  telegramId: number;

  @Prop({ index: true, required: true })
  accountName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiredDate: string;

  @Prop()
  script: string;

  @Prop({ type: Boolean, default: false })
  isAuto: boolean;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
