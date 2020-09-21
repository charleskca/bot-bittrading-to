import { Module, HttpModule } from '@nestjs/common';
import { ChartDataModule } from 'src/chart-data/chart-data.module';
import { BitTradingService } from './bit-trading.service';
import { Player, PlayerSchema } from './bit-trading.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueModule } from 'src/queue/queue.module';
import { BitTradingController } from './bit-trading.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ChartDataModule,
    QueueModule,
  ],
  providers: [BitTradingService],
  exports: [BitTradingService],
  controllers: [BitTradingController],
})
export class BitTradingModule {}
