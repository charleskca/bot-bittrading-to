export const BIT_TRADING_API = {
  login: 'https://api.bittrading.to/api/Account/Login',
  socketUrl: 'https://pub.bittrading.to',
  order: 'https://api.bittrading.to/api/Account/AccountPlaceOrder',
  getResultOrder: 'https://api.bittrading.to/api/Account/GetResultOrder',
  getBalance: 'https://api.bittrading.to/api/Account/GetBalance',
  getOrderHistory:
    'https://api.bittrading.to/api/Account/BotPlaceOrderHistory?PageIndex=1&FromDate=2020-01-01&ToDate=2020-06-24&Pagesize=999',
};

export const PLAYER_TRADES = 'PLAYER_TRADES';

export const BET_TYPE = {
  BUY: 1,
  SELL: 0,
};
