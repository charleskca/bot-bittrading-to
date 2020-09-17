import { Injectable, HttpService } from '@nestjs/common';
import io from 'socket.io-client';
import { catchError, map } from 'rxjs/operators';

import { ChartDataService } from 'src/chart-data/chart-data.service';
import { CHART_DATA_HOOKS } from 'src/chart-data/chart-data.constant';
import { BotTelegramService } from 'src/bot-telegram/bot-telegram.service';
import { BIT_TRADING_API } from './bit-trading.constant';

@Injectable()
export class BitTradingService {
  constructor(
    private httpService: HttpService,
    private readonly chartDataService: ChartDataService,
    private readonly botTelegramService: BotTelegramService,
  ) {
    this._bindObservers();
  }

  private _bindObservers() {
    this.chartDataService.addHook(
      CHART_DATA_HOOKS.afterChartDataChanged,
      this.watchChartDataChanged,
    );

    const { bot, botSendMessage } = this.botTelegramService;
  }

  watchChartDataChanged(data) {
    // console.log('data', data);
    // console.log('watchChartData');
  }

  login(username: string, password: string) {
    return this.httpService
      .post(BIT_TRADING_API.login, {
        AccountName: username,
        Password: password,
      })
      .pipe(
        map(data => {
          console.log('login success');
          return data;
        }),
        catchError(error => {
          return error;
        }),
      )
      .toPromise();
  }
}
