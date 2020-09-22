import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueueProgress,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { BitTradingService } from 'src/bit-trading/bit-trading.service';
import { RedisService } from 'src/redis/redis.service';
import { BIT_TRADING_QUEUE, SYNC_PLAYER_DATA_TO_CACHE } from './queue.constant';

@Processor(BIT_TRADING_QUEUE)
export class QueueConsumer {
  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(
        job.data,
      )}`,
    );
  }

  constructor(
    private readonly bitTradingService: BitTradingService,
    private readonly redisService: RedisService,
  ) {}

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    console.log(
      `Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job, result: any) {
    console.log(
      `onFailed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(
        result,
      )}`,
    );
  }

  @Process(SYNC_PLAYER_DATA_TO_CACHE)
  async syncPlayerDataToCache(job: Job): Promise<any> {
    try {
      const players = await this.bitTradingService.findAllPlayer({
        isAuto: true,
      });
      job.progress(30);

      const playerRecords = players.reduce((acc, cur) => {
        acc[cur._id] = JSON.stringify(cur);
        return acc;
      }, {} as Record<string, string>);
      job.progress(60);

      if (Object.keys(playerRecords).length) {
        await this.redisService.syncMongoToCacheRedis(playerRecords);
      }
      job.progress(100);
      return true;
    } catch (error) {
      job.progress(100);
      throw 'syncPlayerDataToCache Error';
    }
  }

  @OnQueueProgress()
  onQueueProgress(job: Job, progress: number) {
    console.log(job.name, progress);
  }
}
