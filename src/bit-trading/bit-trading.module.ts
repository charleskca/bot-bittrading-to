import { Module, HttpModule } from '@nestjs/common';
import { ChartDataModule } from 'src/chart-data/chart-data.module';
import { BitTradingService } from './bit-trading.service';
import { BotTelegramModule } from 'src/bot-telegram/bot-telegram.module';
import { Player, PlayerSchema } from './bit-trading.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ChartDataModule,
    BotTelegramModule,
  ],
  providers: [BitTradingService],
})
export class BitTradingModule {}
