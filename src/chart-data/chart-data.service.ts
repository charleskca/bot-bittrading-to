import { Injectable, OnModuleInit } from '@nestjs/common';
import * as io from 'socket.io-client';
import { Type, plainToClass } from 'class-transformer';

import { CHART_EVENT, defaultHooks, CHART_DATA_HOOKS } from './chart-data.constant';
import { BitTradingData, ChartHooks } from './chart-data.interface';
import { CandleStickDTO, BitTradingDataDTO } from './dto/chart-data.dto';

@Injectable()
export class ChartDataService implements OnModuleInit {
  onModuleInit() {
    this._initSocket();
  }

  private _socket: SocketIOClient.Socket;
  private _data: BitTradingDataDTO = {
    data: [],
    history: [],
    serverTime: {} as any,
  };
  private _hooks: ChartHooks = defaultHooks();

  private _initSocket() {
    this._socket = io(process.env.CHART_DATA_URI);
    this._socket.addEventListener(CHART_EVENT.connect, () => {
      if (this._socket.connected) {
        this._bindObservers();
      }
    });
  }

  private _bindObservers() {
    this._socket.addEventListener(CHART_EVENT.chartData, (data: BitTradingData) => {
      const bitTradingData = plainToClass(BitTradingDataDTO, data);
      this._data = bitTradingData;
      // call Hooks
      this._hooks[CHART_DATA_HOOKS.afterChartDataChanged].forEach(hook => {
        hook(bitTradingData);
      });
    });
  }

  get socket() {
    return this._socket;
  }

  get data() {
    return this._data;
  }

  public addHook(key, hook) {
    this._hooks[key].push(hook);
  }
}
