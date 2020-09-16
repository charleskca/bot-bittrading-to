import { Injectable } from '@nestjs/common';
import io from 'socket.io-client';
import { ChartDataService } from 'src/chart-data/chart-data.service';
import { CHART_DATA_HOOKS } from 'src/chart-data/chart-data.constant';

@Injectable()
export class BitTradingService {
  socket: any;
  constructor(private readonly chartDataService: ChartDataService) {
    chartDataService.addHook(
      CHART_DATA_HOOKS.afterChartDataChanged,
      this.watchChartData,
    );
  }

  watchChartData(data) {
    // console.log('data', data);
    // console.log('watchChartData');
  }
}
