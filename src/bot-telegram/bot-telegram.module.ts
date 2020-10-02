import { Module } from '@nestjs/common';
import { BotTelegramService } from './bot-telegram.service';
import { BitTradingModule } from 'src/bit-trading/bit-trading.module';
import { BotTelegramSignalService } from './bot-telegram.signal';
import { ChartDataModule } from 'src/chart-data/chart-data.module';

@Module({
  imports: [BitTradingModule, ChartDataModule],
  providers: [BotTelegramService, BotTelegramSignalService],
  exports: [BotTelegramService, BotTelegramSignalService],
})
export class BotTelegramModule {}
