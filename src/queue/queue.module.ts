import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueConsumer } from './queue.consumer';
import { BIT_TRADING_QUEUE } from './queue.constant';

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
  ],
  providers: [QueueService, QueueConsumer],
  exports: [QueueService],
})
export class QueueModule {}
