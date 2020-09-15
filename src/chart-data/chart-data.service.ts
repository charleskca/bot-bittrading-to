import { Injectable, OnModuleInit } from '@nestjs/common';
import * as io from 'socket.io-client';
import { CHART_EVENT } from './chart-data.constants';

@Injectable()
export class ChartDataService implements OnModuleInit {
  private _socket: SocketIOClient.Socket;
  private _data = [];
  private _hooks: Array<(data: any) => void> = [];

  onModuleInit() {
    this._initSocket();
  }

  private _initSocket() {
    this._socket = io(process.env.CHART_DATA_URI);
    this._socket.addEventListener(CHART_EVENT.connect, () => {
      if (this._socket.connected) {
        this._bindObservers();
      }
    });
  }

  private _bindObservers() {
    this._socket.addEventListener(CHART_EVENT.chartData, data => {
      this._data = data;
      this._hooks.forEach(hook => {
        hook(data);
      });
    });
  }

  get getSocket() {
    return this._socket;
  }

  get getData() {
    return this._data;
  }

  addHook(hook) {
    this._hooks.push(hook);
  }
}
