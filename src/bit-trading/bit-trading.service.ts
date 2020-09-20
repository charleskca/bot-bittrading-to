import { Injectable, HttpService } from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { ChartDataService } from 'src/chart-data/chart-data.service';
import { CHART_DATA_HOOKS } from 'src/chart-data/chart-data.constant';
import { BIT_TRADING_API } from './bit-trading.constant';
import { BitTradingDataDTO } from 'src/chart-data/dto/chart-data.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Player } from './bit-trading.schema';
import { Model } from 'mongoose';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerParamsFilter } from './bit-trading.interface';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class BitTradingService {
  constructor(
    private readonly queueSevice: QueueService,
    private readonly chartDataService: ChartDataService,
    private httpService: HttpService,
    @InjectModel(Player.name) private playerModel: Model<Player>,
  ) {
    this._bindObservers();
  }

  private _bindObservers() {
    this.chartDataService.addHook(
      CHART_DATA_HOOKS.afterChartDataChanged,
      this.watchChartDataChanged,
    );
  }

  watchChartDataChanged(data: BitTradingDataDTO) {
    // console.log(data.history.map(a => a.type));
    // console.log(this.chartDataService.data);
    // console.log(data)
    if (data.serverTime.canOrder) {
      if (data.serverTime.second === '1') {
        // query redis
        // dataUser.script
        // console.log(data.serverTime.second);
      }
    }
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
        },
        {
          telegramId: createPlayerDto.telegramId,
        },
      ],
    });
    if (!player) {
      return this.createPlayer(createPlayerDto);
    }
    return player;
  }

  async updateAutoStatusOfPlayer(
    filter: PlayerParamsFilter,
    autoStatus: boolean,
  ) {
    let player = await this.playerModel.findOne(filter);
    if (autoStatus !== player.isAuto && !!player.script) {
      player.isAuto = autoStatus;
      player.save();
      this.queueSevice.updateStatusPlayer(player);
    }
    return player;
  }

  async updateScriptOfPlayer(filter: PlayerParamsFilter, script: string) {
    let player = await this.playerModel.findOne(filter);
    if (script && player.script !== script) {
      player.script = script;
      player.save();
      this.queueSevice.updateScriptPlayer(player);
    }
    return player;
  }

  login(telegramId = 0, username: string, password: string) {
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
}
