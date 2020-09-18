import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { Cron } from '@nestjs/schedule';
import { HELP_TXT, MESSAGES } from './bot-telegram.constant';
import { BitTradingService } from 'src/bit-trading/bit-trading.service';

@Injectable()
export class BotTelegramService implements OnModuleInit {
  onModuleInit() {
    this._initBot();
  }

  constructor(private readonly bitTradingService: BitTradingService) {}

  private _bot: TelegramBot;

  private _initBot() {
    this._bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    this._bindObservers();
  }

  private _bindObservers() {
    this._bot.onText(/^\/help|start$/, (msg, match) => {
      if (msg.from.is_bot) {
        return;
      }
      this.botSendMessage(msg.chat.id, HELP_TXT, {
        parse_mode: 'HTML',
      });
    });

    this._bot.onText(/^\/(l|L)ogin$/, (msg, match) => {
      this.botSendMessage(
        msg.chat.id,
        'Please enter flow command:\n /Livenumber&password. Ví dụ: /L900001&123456.',
      );
    });

    this._bot.onText(
      /^\/(D|L)\s*([0-9]+)*&([a-zA-Z0-9#?!@$%^&*-]+)$/,
      (msg, match) => {
        if (msg.from.is_bot) {
          return;
        }
        if (msg.text == '/Livenumber&password') {
          this.botSendMessage(
            msg.chat.id,
            'Please enter flow command: \n /Livenumber&password. Ví dụ: /L900001&123456.',
          );
          return;
        }
        const myTelegramId = msg.chat.id;
        this._bot.deleteMessage(myTelegramId, String(msg.message_id));
        const info = msg.text.substring(1).split('&');

        if (info.length < 1) return;
        const [username, password] = info;
        this.bitTradingService
          .login(msg.chat.id, username, password)
          .then(res => {
            this.botSendMessage(msg.chat.id, 'Login successfully');
          })
          .catch(err => {
            console.log(err.data);
            this.botSendMessage(msg.chat.id, MESSAGES.LOGIN_FAIL);
          });
      },
    );
  }

  get bot() {
    return this._bot;
  }

  botSendMessage(
    id: number | string,
    msg: string,
    options?: TelegramBot.SendMessageOptions,
  ) {
    this._bot
      .sendMessage(id, msg, options)
      .then(function(resp) {
        // ...snip...
      })
      .catch(function(error) {
        if (error.response && error.response.statusCode === 403) {
          // ...snip...
          console.log('blocked: ' + id);
          //removeInfo(id, -1);
        }
      });
  }

  // @Cron('5 * * * * *')
  // private _cronWaiting() {
  //   if (this._isWaiting) {
  //     // getResult(myTelegramId);
  //     this._isWaiting = false;
  //   }
  // }

  // @Cron('2 * * * * *')
  // private _cronAutoCandle() {
  //   if (this._autoGetCandle) {
  //     // getCandle(myTelegramId);
  //   }
  // }
}
