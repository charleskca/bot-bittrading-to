import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { Cron } from '@nestjs/schedule';

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
      const txt =
        'Hi. You can use the Bot by sending the following commands:\n\
      /login - Show how to login to start.\n\
      /help - Show this guide.\n\
      /b[A] - Order Buy, [A] is amount to order. \n\
      /s[A] - Order Sell, [A] is amount to order.\n\
      /balance - Show balance live account \n\
      /result -  Show result \n\
      /today - Show profit today \n\
      /week - Show profit week \n\
      /month - Show profit month \n\
      /candle - Show 10 candlesticks \n\
      /autocandle - Auto send signal \n\
      /offcandle - Off auto send signal \n\
      ';
      this.botSendMessage(msg.chat.id, txt, { parse_mode: 'HTML' });
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
