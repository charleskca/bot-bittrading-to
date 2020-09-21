import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CreatePlayerDto } from 'src/bit-trading/dto/create-player.dto';
import {
  ADD_REPORT,
  ADD_USER,
  BIT_TRADING_QUEUE,
  SYNC_PLAYER_DATA_TO_CACHE,
} from './queue.constant';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(BIT_TRADING_QUEUE)
    private _queue: Queue,
  ) {
    // this._queue.add('confirmation', {
    //   foo: 'bar',
    // });
  }

  addPlayer(player: CreatePlayerDto) {
    this._queue.add(ADD_USER, player);
  }

  addReport(player: any, report: any) {
    this._queue.add(ADD_REPORT, {
      player,
      report,
    });
  }

  asyncPlayerToRedisCache() {
    this._queue.add(SYNC_PLAYER_DATA_TO_CACHE);
  }

  updateStatusPlayer(player) {}

  updateScriptPlayer(player) {}
}
