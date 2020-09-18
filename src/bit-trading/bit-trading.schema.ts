import { Prop, Schema, SchemaFactory, PropOptions } from '@nestjs/mongoose';
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

  @Prop()
  script: string;

  @Prop({ type: Boolean })
  auto: boolean;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
