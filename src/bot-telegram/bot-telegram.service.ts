import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { Cron } from '@nestjs/schedule';
import {
  ACCOUNT_DONT_HAVE_SCRIPT,
  HELP_TXT,
  INFO_TEMPLATE,
  MESSAGES,
  SCRIPT_HELP_TXT,
  SEPARATOR_SCRIPT,
  AUTO_TRADE_STATUS_TEMPLATE,
  SUGGEST_TEMPLATE,
  UPDATE_SCRIPT_TEMPLATE_SUCCESS_TEMPLATE,
} from './bot-telegram.constant';
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

    this._bot.onText(/^\/(l|L)ogin$/, async (msg, match) => {
      this.botSendMessage(
        msg.chat.id,
        'Vui lòng nhập lệnh luồng:\n /Livenumber&password. Ví dụ: /L900001&123456.',
      );
    });

    this._bot.onText(/^\/(i|I)nfo$/, async (msg, match) => {
      const myTelegramId = getTelegramId(msg);
      try {
        const players =
          (await this.bitTradingService.findAllPlayer({
            telegramId: myTelegramId,
          })) || [];
        let messages = players
          .map(player => {
            return INFO_TEMPLATE(player);
          })
          .join('');
        if (players.length) {
          this.botSendMessage(msg.chat.id, messages, {
            parse_mode: 'HTML',
          });
        } else {
          this.botSendMessage(
            msg.chat.id,
            'Bạn chưa đăng nhập tài khoản nào!!',
          );
        }
      } catch (error) {}
    });

    this._bot.onText(
      /^\/(s|S)how_script_default__(D|L)\s*([0-9]+)*$/,
      async (msg, match) => {
        const myTelegramId = getTelegramId(msg);
        const payload = msg.text.split(SEPARATOR_SCRIPT);
        const [actionNm, accountNm] = payload;
        if (!accountNm.length) return;

        this.botSendMessage(msg.chat.id, SCRIPT_HELP_TXT(accountNm), {
          parse_mode: 'HTML',
        });
      },
    );

    this._bot.onText(
      /^\/(s|S)uggest__(D|L)\s*([0-9]+)*$/,
      async (msg, match) => {
        const myTelegramId = getTelegramId(msg);
        const payload = msg.text.split(SEPARATOR_SCRIPT);
        const [actionNm, accountNm] = payload;
        if (!accountNm.length) return;

        this.botSendMessage(msg.chat.id, SUGGEST_TEMPLATE(accountNm), {
          parse_mode: 'HTML',
        });
      },
    );

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
          .onLogin(myTelegramId, username, password)
          .then(res => {
            this.botSendMessage(workspaceId, 'Login successfully');
          })
          .catch(err => {
            console.log(err.data);
            this.botSendMessage(workspaceId, MESSAGES.LOGIN_FAIL);
          });
      },
    );

    this._bot.onText(
      /^\/(s|S)cript__(D|L)\s*([0-9]+)*__\w*$/,
      async (msg, match) => {
        if (msg.from.is_bot) {
          return;
        }
        const myTelegramId = getTelegramId(msg);
        const workspaceId = msg.chat.id;
        const payload = msg.text.split(SEPARATOR_SCRIPT);
        const [actionNm, accountNm, scriptData] = payload;
        if (!accountNm.length) return;

        try {
          const player = await this.bitTradingService.updateScriptOfPlayer(
            {
              telegramId: myTelegramId,
              accountName: accountNm,
            },
            scriptData,
          );
          if (player.script !== scriptData) {
            throw 'ERROR!';
          }
          this.botSendMessage(
            workspaceId,
            UPDATE_SCRIPT_TEMPLATE_SUCCESS_TEMPLATE(accountNm, player.script),
            {
              parse_mode: 'HTML',
            },
          );
        } catch (error) {
          this.botSendMessage(workspaceId, `Cập nhập kịch bản thất bại`);
        }
      },
    );

    this._bot.onText(/^\/(s|S)top__(D|L)\s*([0-9]+)*$/, async (msg, match) => {
      const myTelegramId = getTelegramId(msg);
      const workspaceId = msg.chat.id;
      const payload = msg.text.split(SEPARATOR_SCRIPT);
      const [actionNm, accountNm] = payload;
      if (!accountNm.length) return;

      try {
        const player = await this.bitTradingService.updateAutoStatusOfPlayer(
          {
            telegramId: myTelegramId,
            accountName: accountNm,
          },
          false,
        );
        this.botSendMessage(
          workspaceId,
          AUTO_TRADE_STATUS_TEMPLATE(accountNm, player.isAuto),
          {
            parse_mode: 'HTML',
          },
        );
      } catch (error) {}
    });

    this._bot.onText(/^\/(t|T)rade__(D|L)\s*([0-9]+)*$/, async (msg, match) => {
      const myTelegramId = getTelegramId(msg);
      const workspaceId = msg.chat.id;
      const payload = msg.text.split(SEPARATOR_SCRIPT);
      const [actionNm, accountNm] = payload;
      if (!accountNm.length) return;
      try {
        const player = await this.bitTradingService.updateAutoStatusOfPlayer(
          {
            telegramId: myTelegramId,
            accountName: accountNm,
          },
          true,
        );
        if (!player.script) {
          this.botSendMessage(
            workspaceId,
            ACCOUNT_DONT_HAVE_SCRIPT(player.accountName),
          );
        } else {
          this.botSendMessage(
            workspaceId,
            AUTO_TRADE_STATUS_TEMPLATE(player.accountName, player.isAuto),
            {
              parse_mode: 'HTML',
            },
          );
        }
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
