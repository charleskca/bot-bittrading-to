import TelegramBot from 'node-telegram-bot-api';

export const getTelegramId = (msg: TelegramBot.Message) => {
  return msg.from.id;
};
