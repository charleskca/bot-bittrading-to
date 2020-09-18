import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitTradingModule } from './bit-trading/bit-trading.module';
import { ChartDataModule } from './chart-data/chart-data.module';
import { BotTelegramModule } from './bot-telegram/bot-telegram.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
    }),
    ScheduleModule.forRoot(),
    BitTradingModule,
    ChartDataModule,
    BotTelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
