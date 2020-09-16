// import technicalIndicators from 'technicalindicators';
import { Type } from 'class-transformer';

import {
  CandleStick,
  BitTradingData,
  ServerTime,
  Trend,
} from '../chart-data.interface';
import { isBullish } from '../chart-data.helper';

export class CandleStickDTO implements CandleStick {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;

  get volume() {
    return Math.abs(this.open - this.close);
  }

  get type() {
    return isBullish(this) ? Trend.bullish : Trend.bearish;
  }
}

export class ServerTimeDTO implements ServerTime {
  currentTime: string;
  second: string;
  canOrder: boolean;
}

export class BitTradingDataDTO implements BitTradingData {
  data: (string | number)[];
  serverTime: ServerTime;

  @Type(() => CandleStickDTO)
  history: CandleStickDTO[];
}
