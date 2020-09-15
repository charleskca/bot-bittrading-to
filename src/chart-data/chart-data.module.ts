import { Module } from '@nestjs/common';
import { ChartDataService } from './chart-data.service';

@Module({
  providers: [ChartDataService],
  exports: [ChartDataService],
})
export class ChartDataModule {}
