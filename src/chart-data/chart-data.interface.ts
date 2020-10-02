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
  data: [string, number, number, number, number][];
  serverTime: ServerTime;
  history: CandleStick[];
}

export enum Trend {
  up = 'up',
  down = 'down',
  bullish = 1,
  bearish = 0,
  // 'up' | 'down' | 'bullish' | 'bearish'
}

export function up(trend: Trend) {
  return trend === 'up' || trend === 0;
}

export function down(trend: Trend) {
  return trend === 'down' || trend === 1;
}

export type ChartHooks = Record<keyof typeof CHART_DATA_HOOKS, ((data: BitTradingDataDTO) => void)[]>;
