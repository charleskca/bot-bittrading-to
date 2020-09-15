import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitTradingModule } from './bit-trading/bit-trading.module';
import { ChartDataModule } from './chart-data/chart-data.module';
import { BotTelegramModule } from './bot-telegram/bot-telegram.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BitTradingModule,
    ChartDataModule,
    BotTelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
