import { Processor, Process, OnQueueActive } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('audio')
export class BitTradingConsumer {
  @Process()
  async transcode(job: Job<unknown>) {
    let progress = 0;
    console.log('transcode', progress);
    for (let i = 0; i < 100; i++) {
      //   await doSomething(job.data);
      progress += 1;
      job.progress(1);
    }
    return {};
  }
}
