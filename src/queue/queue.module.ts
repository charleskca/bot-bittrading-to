import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueConsumer } from './queue.consumer';
import { BIT_TRADING_QUEUE } from './queue.constant';
import { RedisModule } from 'src/redis/redis.module';
import { BitTradingModule } from 'src/bit-trading/bit-trading.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: BIT_TRADING_QUEUE,
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_URI || 'localhost',
          port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
        },
      }),
    }),
    // RedisModule,
    // BitTradingModule,
  ],
  providers: [QueueService, QueueConsumer],
  exports: [QueueService],
})
export class QueueModule {}
