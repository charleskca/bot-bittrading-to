import { Module } from '@nestjs/common';
import { ChartDataModule } from 'src/chart-data/chart-data.module';
import { BitTradingService } from './bit-trading.service';

@Module({
  imports: [ChartDataModule],
  providers: [BitTradingService]
})
export class BitTradingModule {}
