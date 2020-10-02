const PLAY_TYPE = {
  normal: {
    val: 0,
    label: '',
  },
  multiplyLose: {
    val: 1,
    label: 'l',
  },
  multiplyWin: {
    val: 2,
    label: 'w',
  },
  theSameColor: {
    val: 3,
    label: 'x',
  },
};
const BET_TYPE = {
  B: 1,
  S: 0,
  b: 1,
  s: 0,
  theSameColor: 'x',
  0: 's',
  1: 'b',
};
export interface IUserHistory {
  orders: boolean[];
  point: number; // if user lost then -1 point else win +1 point, default = 0
  lastOrderType: number;
}
export const defaultUserHistory = (): IUserHistory => ({
  orders: [], // history orders
  point: 0, // 2 trận win liên tục
  lastOrderType: -1, // lần order cuối cùng, mặc định mới vô chưa đặt là -1, còn buy 1, sell 0
});

enum HOOK_TYPES {
  userHistoryChanged = 'userHistoryChanged',
}

type IHooks = Record<HOOK_TYPES, (<T = any>(payload: T) => void)[]>;

const defaultHooks = (): IHooks => ({
  userHistoryChanged: [],
});

export class AutoTrade {
  private _signalScript!: string;
  private _orderScript!: string;
  private _hooks: IHooks = defaultHooks();

  constructor(public script: string, public userHistory: IUserHistory, public historyData: number[] = []) {
    this._init();
  }

  private _init() {
    const [signalScript, orderScript] = this.script.split('_');
    this._signalScript = (signalScript || '').toLocaleLowerCase();
    this._orderScript = (orderScript || '').toLocaleLowerCase();
  }

  static coverSizeToBetTypeArray(size: number, type: keyof typeof BET_TYPE) {
    const betType = BET_TYPE[type];
    let result = Array.from(Array(Number(size)), () => betType as number);
    return result;
  }

  get signal() {
    const scriptMatch = this._signalScript.match(/\d+|\w/g);
    if (!scriptMatch) {
      throw 'Error';
    }
    let result = scriptMatch.reduce((acc, cur, index, originArr) => {
      let _cur = Number(cur);
      if (!(index % 2)) {
        acc = [...acc, ...AutoTrade.coverSizeToBetTypeArray(_cur, originArr[index + 1] as keyof typeof BET_TYPE)];
      }
      return acc;
    }, [] as number[]);
    if (scriptMatch && scriptMatch[1] === BET_TYPE.theSameColor) {
      result = result.map(() => this.lastBetTypeOfCandle);
    }
    return result;
  }

  get capitalManagement() {
    return Math.abs(this.userHistory.point);
  }

  get isLastWon() {
    return this.userHistory.point > 0;
  }

  get isLastLost() {
    return this.userHistory.point < 0;
  }

  get isCoast() {
    // Reset quản lí tiền ==> về bờ
    return this.userHistory.point === 0;
  }

  get lastBetTypeOfCandle() {
    return this.historyData[this.historyData.length - 1];
  }

  get orderScriptType() {
    if (this._orderScript.indexOf(PLAY_TYPE.multiplyLose.label) !== -1) {
      return PLAY_TYPE.multiplyLose.val;
    } else if (this._orderScript.indexOf(PLAY_TYPE.multiplyWin.label) !== -1) {
      return PLAY_TYPE.multiplyWin.val;
    } else if (this._orderScript.indexOf(PLAY_TYPE.theSameColor.label) !== -1) {
      return PLAY_TYPE.theSameColor.val;
    } else {
      return PLAY_TYPE.normal.val;
    }
  }

  get isSignalCorrect() {
    const _history = this.historyData.slice(this.historyData.length - this.signal.length);
    return _history.join('') === this.signal.join('');
  }

  private _parseAmountAndType(script: string) {
    return script.match(/\d+|\w/g) || [];
  }

  private _parseGroupOrder(script: string) {
    return script.match(/\w\d+/g) || [];
  }

  get orderGroupsParse() {
    return this._parseGroupOrder(this._orderScript);
  }

  private get _amountAndBetType() {
    let result: (string | number)[] = [];
    const orderGroupsParse = this.orderGroupsParse;
    if (this.orderScriptType === PLAY_TYPE.normal.val) {
      let capitalManagement = this.capitalManagement;
      if (this.capitalManagement >= orderGroupsParse.length) {
        // Reset capital management
        capitalManagement = 0;
        // this._hooks[HOOK_TYPES.userHistoryChanged].forEach(hook => {
        //   hook(this.userHistory);
        // });
      }
      const scriptOrdered = orderGroupsParse[capitalManagement];
      result = this._parseAmountAndType(scriptOrdered);
    } else if (this.orderScriptType === PLAY_TYPE.multiplyLose.val) {
      if (orderGroupsParse.length !== 2) throw 'Script format wrong!!';

      const [scriptOrdered, scriptCaptialManagement] = orderGroupsParse;
      result = this._parseAmountAndType(scriptOrdered);
      if (this.isLastLost) {
        const [numberOfCaptialManagement] = scriptCaptialManagement.match(/\d+/g) || [1];
        const capitalManagement = this.capitalManagement;
        // Quản lí vốn khi thua, thua nhân lên
        result[1] = Number(result[1]) * Math.pow(Number(numberOfCaptialManagement), capitalManagement);
      }
    } else if (this.orderScriptType === PLAY_TYPE.multiplyWin.val) {
      const [scriptOrdered, scriptCaptialManagement] = orderGroupsParse;
      result = this._parseAmountAndType(scriptOrdered);
      if (this.isLastWon) {
        const [numberOfCaptialManagement] = scriptCaptialManagement.match(/\d+/g) || [1];
        const capitalManagement = this.capitalManagement;
        // Quản lí vốn khi win, win nhân lên
        result[1] = Number(result[1]) * Math.pow(Number(numberOfCaptialManagement), capitalManagement);
      }
    } else if (this.orderScriptType === PLAY_TYPE.theSameColor.val) {
      const scriptOrdered = orderGroupsParse[0]; // hardcode
      result = this._parseAmountAndType(scriptOrdered);
      result[0] = BET_TYPE[this.lastBetTypeOfCandle as keyof typeof BET_TYPE];
    }

    return result;
  }

  get amount() {
    return Number(this._amountAndBetType[1]);
  }

  get betType() {
    return BET_TYPE[this._amountAndBetType[0] as keyof typeof BET_TYPE] as number;
  }

  addHook(key: keyof typeof HOOK_TYPES, hook: (payload: any) => void) {
    this._hooks[key].push(hook);
  }
}

const historyData = [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0]; // data nến của server
// format script hiện tại có 4 loại, for ex: 2b_b10, 1b2s_b10b20b40, 2b_b2l2, 3s_s1w2, 3x_
let userHistory = {
  orders: [], // history orders
  point: 2, // 2 trận win liên tục
  lastOrderType: -1, // lần order cuối cùng, mặc định mới vô chưa đặt là -1, còn buy 1, sell 0
};
const autoTrade = new AutoTrade('3x_x20', userHistory, historyData);
// cac mau format
// /script__D123719__2b_b10 - Mua 10 khi chuỗi tín hiệu kết thúc với 2 nến MUA.
// /script__D123719__3s_s20 - Bán 20 khi chuỗi tín hiệu kết thúc với 3 nến BÁN.
// /script__D123719__3x_s20 - Bán 20 khi chuỗi tín hiệu kết thúc với 3 nến BÁN hoặc 3 nến mua.
// /script__D123719__3x_x20 - bán 20 khi chuối tín hiệu kết thúc với 3 nến bán, hoặc mua 20 khi chuỗi kết thúc 3 nến mua
// /script__D123719__1b2s_b10b20b40 - Mua 10 khi chuỗi tín hiệu kết thúc với 1 nến MUA & 2 nến BÁN, nếu thua, mua 20, nếu vẫn thua, mua lại 40, nếu vẫn thua, mua lại 10.

// * Số tiền mua - bán của Multple khi thua:
// /script__D123719__2b_b2l2 - Mua 2 khi chuỗi tín hiệu kết thúc với 2 nến MUA, nếu thua, mua số tiền x 2. Đặt lại số tiền mua thành 2 khi thắng.

// * Số tiền mua - bán của Multple khi thắng:
// /script__D123719__3s_s1w2 - Bán 1 khi chuỗi tín hiệu kết thúc với 3 nến BÁN, nếu thắng, số tiền bán x 2. Đặt lại số tiền bán thành 1 khi thua.

console.log('autoTrade', autoTrade);

console.log('isSignalCorrect: ', autoTrade.isSignalCorrect, ' || amount', autoTrade.amount, '  || betType: ', autoTrade.betType);

console.log(userHistory);

// bsssssb
// bsssssb
// sbbbbbs
// bsssssb
// sbbbbbs
// bsssssb
// sbbbbbs
