import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  OnQueueProgress,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
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

  @Process('confirmation')
  async sendWelcomeEmail(job: Job<{ user: any; code: string }>): Promise<any> {
    let progress = 0;
    for (let i = 0; i < 100; i++) {
      //   await doSomething(job.data);
      progress += 10;
      // job.progress(1);
      // job
    }
    // return false;
    job.progress(200);
    throw 'error';
    console.log('QueueProcessor', true);
    // this.logger.log(`Sending confirmation email to '${job.data.user.email}'`);
    // const url = `${config.get('server.origin')}/auth/${job.data.code}/confirm`;
    // if (config.get<boolean>('mail.live')) {
    //   return 'SENT MOCK CONFIRMATION EMAIL';
    // }
    // try {
    //   const result = await this.mailerService.sendMail({
    //     template: 'confirmation',
    //     context: {
    //       ...plainToClass(User, job.data.user),
    //       url: url,
    //     },
    //     subject: `Welcome to ${config.get(
    //       'app.name',
    //     )}! Please Confirm Your Email Address`,
    //     to: job.data.user.email,
    //   });
    //   return result;
    // } catch (error) {
    //   this.logger.error(
    //     `Failed to send confirmation email to '${job.data.user.email}'`,
    //     error.stack,
    //   );
    //   throw error;
    // }
  }

  @Process(SYNC_PLAYER_DATA_TO_CACHE)
  async syncPlayerDataToCache() {}

  @OnQueueProgress()
  test(job: Job, progress: number) {
    console.log(job.name, progress);
  }
}
