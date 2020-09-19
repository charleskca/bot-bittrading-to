import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { Cron } from '@nestjs/schedule';
import { HELP_TXT, MESSAGES } from './bot-telegram.constant';
import { BitTradingService } from 'src/bit-trading/bit-trading.service';
import { getTelegramId } from './bot-telegram.util';

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
      const workspaceId = msg.chat.id;
      this.botSendMessage(workspaceId, HELP_TXT, {
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
      async (msg, match) => {
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

        const myTelegramId = getTelegramId(msg);
        const workspaceId = msg.chat.id;
        this._bot
          .deleteMessage(myTelegramId, String(msg.message_id))
          .catch(() => {});
        const info = msg.text.substring(1).split('&');

        if (info.length < 1) return;
        const [username, password] = info;
        this.bitTradingService
          .login(myTelegramId, username, password)
          .then(res => {
            this.botSendMessage(workspaceId, 'Login successfully');
          })
          .catch(err => {
            console.log(err.data);
            this.botSendMessage(workspaceId, MESSAGES.LOGIN_FAIL);
          });
      },
    );

    this._bot.onText(/^\/(script::)\w*$/, async (msg, match) => {
      if (msg.from.is_bot) {
        return;
      }
      const myTelegramId = getTelegramId(msg);
      const workspaceId = msg.chat.id;
      const scriptData = msg.text.substring(1);

      try {
        const player = await this.bitTradingService.updateScriptOfPlayer(
          {
            telegramId: myTelegramId,
          },
          scriptData,
        );
        if (player.script !== scriptData) {
          throw 'ERROR!';
        }
        this.botSendMessage(workspaceId, `SCRIPT UPDATED: ${player.script}`);
      } catch (error) {
        this.botSendMessage(workspaceId, `UPDATE SCRIPT FAIL`);
      }
    });

    this._bot.onText(/^\/(stop)*$/, async (msg, match) => {
      const myTelegramId = getTelegramId(msg);
      const workspaceId = msg.chat.id;
      try {
        const data = await this.bitTradingService.updateAutoStatusOfPlayer(
          {
            telegramId: myTelegramId,
          },
          false,
        );
        this.botSendMessage(workspaceId, `is Stop: ${data.isAuto}`);
      } catch (error) {}
    });

    this._bot.onText(/^\/(trade)*$/, async (msg, match) => {
      const myTelegramId = getTelegramId(msg);
      const workspaceId = msg.chat.id;
      try {
        const data = await this.bitTradingService.updateAutoStatusOfPlayer(
          {
            telegramId: myTelegramId,
          },
          true,
        );
        this.botSendMessage(workspaceId, `is Trade: ${data.isAuto}`);
      } catch (error) {}
    });
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
