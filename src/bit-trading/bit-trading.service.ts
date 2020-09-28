import { Injectable, HttpService, OnModuleInit } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import * as moment from 'moment';

import { ChartDataService } from 'src/chart-data/chart-data.service';
import { CHART_DATA_HOOKS } from 'src/chart-data/chart-data.constant';
import { BET_TYPE, BIT_TRADING_API } from './bit-trading.constant';
import { BitTradingDataDTO } from 'src/chart-data/dto/chart-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './bit-trading.schema';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dto/create-player.dto';
import { IPlayer, PlayerParamsFilter } from './bit-trading.interface';
import { QueueService } from 'src/queue/queue.service';
import { RedisService } from 'src/redis/redis.service';
import { defaultUserHistory, isExpired, scriptUtils } from './bit-trading.util';

@Injectable()
export class BitTradingService implements OnModuleInit {
  onModuleInit() {}

  _snapshot = [];
  _orderedFlg = false;
  _lastOrder = {};

  constructor(
    private readonly queueSevice: QueueService,
    private readonly chartDataService: ChartDataService,
    private httpService: HttpService,
    @InjectModel(Player.name) private playerModel: Model<Player>,
    private readonly redisService: RedisService,
  ) {
    this._bindObservers();
  }

  private _bindObservers() {
    this.chartDataService.addHook(
      CHART_DATA_HOOKS.afterChartDataChanged,
      data => this.watchChartDataChanged(data),
    );
  }

  async watchChartDataChanged(data: BitTradingDataDTO) {
    // console.log(data.history.map(e => e.type));
    // console.log(data.serverTime.canOrder);
    if (data.serverTime.canOrder) {
      if (this._orderedFlg || Number(data.serverTime.second) > 25) return;
      //
      this._orderedFlg = true;
      console.log('data.serverTime.second', data.serverTime.second);
      const playerRecords = (await this.redisService.getPlayerTrades()) || {};
      const players: IPlayer[] = Object.values(playerRecords).map(player =>
        JSON.parse(player),
      );
      players.forEach(player => {
        if (!player.isAuto) {
          return;
        }
        const isTokenExpired = isExpired(player.expiredDate);
        if (isTokenExpired) {
          console.log('isTokenExpired');
          this.onLogin(player.telegramId, player.accountName, player.password)
            .then(() => {
              console.log(`refresh token ${player.accountName} SUCCESS`);
            })
            .catch(() => {
              console.log(`refresh token ${player.accountName} FAIL`);
            });
        } else {
          // Order in here
          this._lastOrder[player.accountName] = this._lastOrder[
            player.accountName
          ]
            ? this._lastOrder[player.accountName]
            : defaultUserHistory();
          const script = player.script;
          const [conditionScript, orderScript] = script.split('_');
          const conditionScriptParsed = scriptUtils.parse(conditionScript);
          console.log('conditionScriptParsed', conditionScriptParsed);
          const isCorrectScript = scriptUtils.isCorrectScript(
            data.history.map(e => e.type),
            conditionScriptParsed,
          );
          console.log('isCorrectScript', isCorrectScript);
          const [betType, amount] = scriptUtils.getAmountAndType(orderScript);
          if (!isCorrectScript) return;
          this._lastOrder[player.accountName] =
            betType === 'b' ? BET_TYPE.BUY : BET_TYPE.SELL;
          this.onOrder(
            player.token,
            betType === 'b' ? BET_TYPE.BUY : BET_TYPE.SELL,
            Number(amount),
          )
            .catch(err => {
              console.log('order', err);
            })
            .then(res => {
              // console.log('order Success', res);
            });
        }
      });
      console.log(data.serverTime);
    } else {
      this._orderedFlg = false;
    }
  }

  async getPlayerTrades(id?: string) {
    return this.redisService.getPlayerTrades(id);
  }

  async syncMongoToCacheRedis(value: Player[] | null = null) {
    this.queueSevice.asyncPlayerToRedisCache();
    return {};
  }

  async findAllPlayer(filter: PlayerParamsFilter = {}) {
    return this.playerModel.find(filter);
  }

  async createPlayer(createPlayerDto: CreatePlayerDto) {
    const player = await new this.playerModel(createPlayerDto);
    return player.save();
  }

  async findOrCreatePlayer(createPlayerDto: CreatePlayerDto) {
    let player = await this.playerModel.findOne({
      $or: [
        {
          accountName: createPlayerDto.accountName,
          telegramId: createPlayerDto.telegramId,
        },
      ],
    });
    if (!player) {
      return this.createPlayer(createPlayerDto);
    } else {
      player.expiredDate = createPlayerDto.expiredDate;
      player.token = createPlayerDto.token;
      // if (player.password !== createPlayerDto.password) {
      //   player.password = createPlayerDto.token;
      // }
      player.save();
    }
    this.queueSevice.asyncPlayerToRedisCache();
    return player;
  }

  async updateAutoStatusOfPlayer(
    filter: PlayerParamsFilter,
    autoStatus: boolean,
  ) {
    let player = await this.playerModel.findOne(filter);
    if (player && autoStatus !== player.isAuto && !!player.script) {
      player.isAuto = autoStatus;
      await player.save();
      this.queueSevice.asyncPlayerToRedisCache();
    }
    return player;
  }

  async updateScriptOfPlayer(filter: PlayerParamsFilter, script: string) {
    let player = await this.playerModel.findOne(filter);
    if (script && player.script !== script) {
      player.script = script;
      player.save();
      this.queueSevice.asyncPlayerToRedisCache();
    }
    return player;
  }

  onLogin(telegramId = 0, username: string, password: string) {
    return this.httpService
      .post(BIT_TRADING_API.login, {
        AccountName: username,
        Password: password,
      })
      .pipe(
        map(response => {
          const player = {
            accountName: username,
            password: password,
            telegramId: telegramId,
            expiredDate: response.data.data.expiredDate,
            token: response.data.data.token,
          };
          this.findOrCreatePlayer(player);
          return response.data;
        }),
        catchError(error => {
          return throwError(error.response);
        }),
      )
      .toPromise();
  }

  onOrder(token: string, betType: number, amount: number) {
    return this.httpService
      .post(
        BIT_TRADING_API.order,
        {
          Amount: amount,
          BetType: betType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .toPromise();
  }

  onGetResultOrder(token: string) {
    return this.httpService.get(BIT_TRADING_API.getResultOrder, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  onGetBalance(token: string) {
    return this.httpService.get(BIT_TRADING_API.getBalance, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  onGetOrderHistory(
    token: string,
    to,
    from: Date | string = '2020-01-01',
    pageIndex = 1,
    pagesize = 999,
  ) {
    let qr = {
      PageIndex: pageIndex,
      FromDate: from,
      ToDate: to,
      Pagesize: pagesize,
    };
    return this.httpService
      .get(BIT_TRADING_API.getOrderHistory, {
        data: {
          ...qr,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map(response => {
          return {
            ...response.data,
            FromDate: from,
            ToDate: to,
          };
        }),
        catchError(error => {
          return throwError(error.response);
        }),
      )
      .toPromise();
  }

  async findOrRefreshToken(filter: PlayerParamsFilter) {
    let player = await this.playerModel.findOne(filter);
    const isTokenExpired = isExpired(player.expiredDate);
    if (isTokenExpired) {
      const userLogin = await this.onLogin(
        player.telegramId,
        player.accountName,
        player.password,
      );
      player.token = userLogin.data.token;
      player.expiredDate = userLogin.data.expiredDate;
    }
    return player;
  }

  async onGetHistoryToday(
    filter: PlayerParamsFilter,
    pageIndex = 1,
    pagesize = 999,
  ) {
    let player = await this.findOrRefreshToken(filter);
    if (!player) {
      throw 'not found user';
    }

    const to = moment()
      .utc()
      .toDate();
    let from = moment()
      .utc()
      .startOf('date')
      .toDate();
    return this.onGetOrderHistory(player.token, to, from, pageIndex, pagesize);
  }

  async onGetHistoryWeek(
    filter: PlayerParamsFilter,
    pageIndex = 1,
    pagesize = 999,
  ) {
    let player = await this.findOrRefreshToken(filter);
    if (!player) {
      throw 'not found user';
    }

    const to = moment()
      .utc()
      .toDate();
    let from = moment()
      .utc()
      .startOf('week')
      .toDate();
    return this.onGetOrderHistory(player.token, to, from, pageIndex, pagesize);
  }

  async onGetHistoryMonth(
    filter: PlayerParamsFilter,
    pageIndex = 1,
    pagesize = 999,
  ) {
    let player = await this.findOrRefreshToken(filter);
    if (!player) {
      throw 'not found user';
    }

    const to = moment()
      .utc()
      .toDate();
    let from = moment()
      .utc()
      .startOf('month')
      .toDate();
    return this.onGetOrderHistory(player.token, to, from, pageIndex, pagesize);
  }
}
