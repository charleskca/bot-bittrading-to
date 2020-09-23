import { Player } from './bit-trading.schema';

export interface updateAutoStatusOfPlayerFilter {
  telegramId?: number;
  accountName?: string;
}

export interface PlayerParamsFilter {
  telegramId?: number;
  accountName?: string;
}

export type IPlayer = Pick<
  Player,
  | '_id'
  | 'uuid'
  | 'script'
  | 'isAuto'
  | 'accountName'
  | 'expiredDate'
  | 'token'
  | 'password'
  | 'telegramId'
>;
