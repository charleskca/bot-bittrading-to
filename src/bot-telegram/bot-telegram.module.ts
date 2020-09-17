import { Module } from '@nestjs/common';
import { BotTelegramService } from './bot-telegram.service';
import { BitTradingModule } from 'src/bit-trading/bit-trading.module';

@Module({
  imports: [BitTradingModule],
  providers: [BotTelegramService],
  exports: [BotTelegramService],
})
export class BotTelegramModule {}
