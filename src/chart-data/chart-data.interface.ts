import { ValueOf } from 'src/types';
import { defaultHooks, CHART_DATA_HOOKS } from './chart-data.constant';
import { BitTradingDataDTO } from './dto/chart-data.dto';

export interface CandleStick {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface ServerTime {
  currentTime: string;
  second: string;
  canOrder: boolean;
}

export interface BitTradingData {
  data: ValueOf<CandleStick>[];
  serverTime: ServerTime;
  history: CandleStick[];
}

export enum Trend {
  up = 'up',
  down = 'down',
  bullish = 'bullish',
  bearish = 'bearish',
  // 'up' | 'down' | 'bullish' | 'bearish'
}

export function up(trend: Trend) {
  return trend === 'up' || trend === 'bullish';
}

export function down(trend: Trend) {
  return trend === 'down' || trend === 'bearish';
}

export type ChartHooks = Record<
  keyof typeof CHART_DATA_HOOKS,
  ((data: BitTradingDataDTO) => void)[]
>;
