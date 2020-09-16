import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { Cron } from '@nestjs/schedule';
import { HELP_TXT } from './bot-telegram.constant';

@Injectable()
export class BotTelegramService implements OnModuleInit {
  onModuleInit() {
    this._initBot();
  }

  private _bot: TelegramBot;
  private _isWaiting = false;
  private _autoGetCandle = false;

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

      this.botSendMessage(msg.chat.id, HELP_TXT, { parse_mode: 'HTML' });
    });
  }

  botSendMessage(id, msg, options) {
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

  @Cron('5 * * * * *')
  private _cronWaiting() {
    if (this._isWaiting) {
      // getResult(myTelegramId);
      this._isWaiting = false;
    }
  }

  @Cron('2 * * * * *')
  private _cronAutoCandle() {
    if (this._autoGetCandle) {
      // getCandle(myTelegramId);
    }
  }
}
