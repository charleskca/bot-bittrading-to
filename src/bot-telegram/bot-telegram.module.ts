import { Module } from '@nestjs/common';
import { BotTelegramService } from './bot-telegram.service';

@Module({
  providers: [BotTelegramService]
})
export class BotTelegramModule {}
