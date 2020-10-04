import { Injectable, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
// import { Cron } from '@nestjs/schedule';

import { GET_PROFILE_BOT_TEMPLATE, HELP_TXT, SIGNAL_TEMPLATE } from './bot-telegram.message';
import { BitTradingService } from 'src/bit-trading/bit-trading.service';
import { getTelegramId } from './bot-telegram.util';
import { SEPARATOR_SCRIPT } from './bot-telegram.constant';
import { ChartDataService } from 'src/chart-data/chart-data.service';
import { CHART_DATA_HOOKS } from 'src/chart-data/chart-data.constant';
import { BitTradingDataDTO } from 'src/chart-data/dto/chart-data.dto';

@Injectable()
export class BotTelegramSignalService implements OnModuleInit {
  onModuleInit() {
    this._initBot();
  }
  _isSendSignal = false;

  constructor(private readonly chartDataService: ChartDataService) {}

  private _bot: TelegramBot;

  private _initBot() {
    this._bot = new TelegramBot(process.env.TELEGRAM_SIGNAL_BOT_TOKEN, {
      polling: true,
    });
    this._bindObservers();
  }

  private _bindObservers() {
    if (process.env.ENABLE_SIGNAL_BOT !== 'true') return;
    this.chartDataService.addHook(CHART_DATA_HOOKS.afterChartDataChanged, data => this.watchChartDataChanged(data));
    // start
    this._bot.onText(/^\/help|start$/, (msg, match) => {
      if (msg.from.is_bot) {
        return;
      }
      const workspaceId = msg.chat.id;
      this.botSendMessage(workspaceId, GET_PROFILE_BOT_TEMPLATE(msg.from), {
        parse_mode: 'HTML',
      });
    });
  }

  private watchChartDataChanged(data: BitTradingDataDTO) {
    if (data.serverTime.canOrder) {
      if (!this._isSendSignal) return;
      this._isSendSignal = false;
      const signalHistory = data.history.map(e => e.type);
      const workspaceIds = ['963106161', '244598583'];
      workspaceIds.forEach(workspaceId => {
        this.botSendMessage(workspaceId, SIGNAL_TEMPLATE(signalHistory), {
          parse_mode: 'HTML',
        });
      });
    } else {
      this._isSendSignal = true;
    }
  }

  get bot() {
    return this._bot;
  }

  botSendMessage(id: number | string, msg: string, options?: TelegramBot.SendMessageOptions) {
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
}
