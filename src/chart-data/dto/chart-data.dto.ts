// import technicalIndicators from 'technicalindicators';
import { Type } from 'class-transformer';

import { CandleStick, BitTradingData, ServerTime, Trend } from '../chart-data.interface';
import { isBullish } from '../chart-data.helper';

export class CandleStickDTO implements CandleStick {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  type: number;
  // get volume() {
  //   return Math.abs(this.open - this.close);
  // }

  // get type() {
  //   return isBullish(this) ? Trend.bullish : Trend.bearish;
  // }
}

export class ServerTimeDTO implements ServerTime {
  currentTime: string;
  second: string;
  canOrder: boolean;
}

export class BitTradingDataDTO implements BitTradingData {
  data: [string, number, number, number, number][];
  serverTime: ServerTime;

  @Type(() => CandleStickDTO)
  get history(): CandleStickDTO[] {
    return this.data
      .filter(Candle => Candle[0].indexOf(':30') !== -1)
      .map(data => {
        const [time, low, open, close, high] = data;
        return {
          time,
          low,
          open,
          close,
          high,
          volume: Math.abs(open - close),
          type: isBullish({ open, close }) ? Trend.bullish : Trend.bearish,
        } as CandleStickDTO;
      });
  }
}

// [ '56:30', 10548.71, 10548.72, 10548.9, 10549.34 ],
// time: 56:30
// open: 10548.72
// close: 10548.9
// lowest: 10548.71
// highest: 10549.34
