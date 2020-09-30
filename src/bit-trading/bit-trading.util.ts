import { BET_TYPE } from './bit-trading.constant';

export const A_HOUR = 3600000;

export const isExpired = (date: string) => {
  const now = new Date().getTime();
  const targetTime = new Date(date).getTime();
  return !(targetTime - now - A_HOUR > 0);
};

// export const cover

export const scriptUtils = {
  parse(script) {
    const scriptMatch = script.match(/\d+|\w/g);
    return scriptMatch.reduce((acc, cur, index, originArr) => {
      let _cur = Number(cur);
      if (!(index % 2)) {
        acc = [
          ...acc,
          ...scriptUtils.coverSizeToType(_cur, originArr[index + 1]),
        ];
      }
      return acc;
    }, []);
  },
  coverSizeToType(size, type) {
    const betType = type === 'b' ? 1 : 0;
    let result = Array.from(Array(Number(size)), (_, x) => betType);
    return result;
  },
  isCorrectScript(history, conditionScript) {
    const _history = history.slice(history.length - conditionScript.length);
    console.log(_history);
    return _history.join('') === conditionScript.join('');
  },
  getAmountAndType(script) {
    return script.match(/\d+|\w/g);
  },
};

export const defaultUserHistory = () => ({
  orders: [], // history orders
  point: 0, // 2 trận win liên tục
  lastOrderType: -1, // lần order cuối cùng, mặc định mới vô chưa đặt là -1, còn buy 1, sell 0
});
