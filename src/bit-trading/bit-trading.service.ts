import { Injectable } from '@nestjs/common';
import io from 'socket.io-client';
import { ChartDataService } from 'src/chart-data/chart-data.service';

@Injectable()
export class BitTradingService {
  socket: any;
  constructor(private readonly chartDataService: ChartDataService) {
    chartDataService.addHook(this.watchChartData);
  }

  watchChartData(data) {
    // console.log('data', data);
    // console.log('watchChartData');
  }
}
