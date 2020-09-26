import {
  Injectable,
  HttpService,
  CACHE_MANAGER,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Cache } from 'cache-manager';
import * as redis from 'redis';

import { ChartDataService } from 'src/chart-data/chart-data.service';
import { CHART_DATA_HOOKS } from 'src/chart-data/chart-data.constant';
import {
  BET_TYPE,
  BIT_TRADING_API,
  PLAYER_TRADES,
} from './bit-trading.constant';
import { BitTradingDataDTO } from 'src/chart-data/dto/chart-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './bit-trading.schema';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dto/create-player.dto';
import { IPlayer, PlayerParamsFilter } from './bit-trading.interface';
import { QueueService } from 'src/queue/queue.service';
import { promisify } from 'util';
import { RedisService } from 'src/redis/redis.service';
import { isExpired } from './bit-trading.util';

@Injectable()
export class BitTradingService implements OnModuleInit {
  onModuleInit() {}

  _snapshot = [];

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
    let orderedFlg = false;
    if (data.serverTime.canOrder) {
      console.log(data.serverTime.second);
      if (!orderedFlg && Number(data.serverTime.second) === 1) {
        orderedFlg = true;
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
            this.onLogin(0, player.accountName, player.password)
              .then(() => {
                console.log(`refresh token ${player.accountName} SUCCESS`);
              })
              .catch(() => {
                console.log(`refresh token ${player.accountName} FAIL`);
              });
          } else {
            // Order in here
            this.onOrder(player.token, BET_TYPE.BUY, 1)
              .catch(err => {
                console.log('order', err);
              })
              .then(res => {
                // console.log('order Success', res);
              });
          }
        });
        console.log(data.serverTime);
      }
    } else {
      orderedFlg = false;
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
          return response;
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

  onGetOrderHistory(token: string) {
    return this.httpService.get(BIT_TRADING_API.getOrderHistory, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
