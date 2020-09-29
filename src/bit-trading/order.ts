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
};
const BET_TYPE = {
  B: 1,
  S: 0,
  b: 1,
  s: 0,
};
const HOOK_TYPES = {
  userHistoryChanged: 'userHistoryChanged',
};
interface IUserHistory {
  orders: boolean[];
  point: number; // if user lost then -1 point else win +1 point, default = 0
  lastOrderType: number;
}
export class AutoTrade {
  private _signalScript!: string;
  private _orderScript!: string;
  private _hooks: Record<
    string | keyof typeof HOOK_TYPES,
    ((payload: any) => void)[]
  > = {
    [HOOK_TYPES.userHistoryChanged]: [],
  };
  constructor(
    public script: string,
    public userHistory: IUserHistory,
    public historyData: number[] = [],
  ) {
    this._init();
  }

  private _init() {
    const [signalScript, orderScript] = this.script.split('_');
    this._signalScript = signalScript;
    this._orderScript = orderScript;
  }

  static coverSizeToBetTypeArray(size: number, type: keyof typeof BET_TYPE) {
    const betType = BET_TYPE[type];
    let result = Array.from(Array(Number(size)), () => betType);
    return result;
  }

  get signal() {
    const scriptMatch = this._signalScript.match(/\d+|\w/g);
    if (!scriptMatch) {
      throw 'Error';
    }
    return scriptMatch.reduce((acc, cur, index, originArr) => {
      let _cur = Number(cur);
      if (!(index % 2)) {
        acc = [
          ...acc,
          ...AutoTrade.coverSizeToBetTypeArray(
            _cur,
            originArr[index + 1] as keyof typeof BET_TYPE,
          ),
        ];
      }
      return acc;
    }, [] as number[]);
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

  get orderScriptType() {
    if (this._orderScript.indexOf(PLAY_TYPE.multiplyLose.label) !== -1) {
      return PLAY_TYPE.multiplyLose.val;
    } else if (this._orderScript.indexOf(PLAY_TYPE.multiplyWin.label) !== -1) {
      return PLAY_TYPE.multiplyWin.val;
    } else {
      return PLAY_TYPE.normal.val;
    }
  }

  get isSignalCorrect() {
    const _history = this.historyData.slice(
      this.historyData.length - this.signal.length,
    );
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
      if (this.capitalManagement >= orderGroupsParse.length) {
        // Reset capital management
        this.userHistory.point = 0;
        this._hooks[HOOK_TYPES.userHistoryChanged].forEach(hook => {
          hook(this.userHistory);
        });
      }
      const scriptOrdered = orderGroupsParse[this.capitalManagement];
      result = this._parseAmountAndType(scriptOrdered);
    } else if (this.orderScriptType === PLAY_TYPE.multiplyLose.val) {
      if (orderGroupsParse.length !== 2) throw 'Script format wrong!!';

      const [scriptOrdered, scriptCaptialManagement] = orderGroupsParse;
      result = this._parseAmountAndType(scriptOrdered);
      if (this.isLastLost) {
        const [numberOfCaptialManagement] = scriptCaptialManagement.match(
          /\d+/g,
        ) || [1];
        const capitalManagement = this.capitalManagement;
        // Quản lí vốn khi thua, thua nhân lên
        result[1] =
          Number(result[1]) *
          Math.pow(Number(numberOfCaptialManagement), capitalManagement);
      }
    } else if (this.orderScriptType === PLAY_TYPE.multiplyWin.val) {
      if (orderGroupsParse.length !== 2) throw 'Script format wrong!!';
      const [scriptOrdered, scriptCaptialManagement] = orderGroupsParse;
      result = this._parseAmountAndType(scriptOrdered);
      if (this.isLastWon) {
        const [numberOfCaptialManagement] = scriptCaptialManagement.match(
          /\d+/g,
        ) || [1];
        const capitalManagement = this.capitalManagement;
        // Quản lí vốn khi win, win nhân lên
        result[1] =
          Number(result[1]) *
          Math.pow(Number(numberOfCaptialManagement), capitalManagement);
      }
    }

    return result;
  }

  get amount() {
    return this._amountAndBetType[1];
  }

  get betType() {
    return this._amountAndBetType[0];
  }
}

// const historyData = [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1]; // data nến của server
// // format script hiện tại có 4 loại, for ex: 2b_b10, 1b2s_b10b20b40, 2b_b2l2, 3s_s1w2
// const autoTrade = new AutoTrade(
//   '2b_b10',
//   {
//     orders: [], // history orders
//     point: 2, // 2 trận win liên tục
//     lastOrderType: -1, // lần order cuối cùng, mặc định mới vô chưa đặt là -1, còn buy 1, sell 0
//   },
//   historyData,
// );

// // cac mau format
// // /script__D123719__2b_b10 - Mua 10 khi chuỗi tín hiệu kết thúc với 2 nến MUA.
// // /script__D123719__3s_s20 - Bán 20 khi chuỗi tín hiệu kết thúc với 3 nến BÁN.
// // /script__D123719__1b2s_b10b20b40 - Mua 10 khi chuỗi tín hiệu kết thúc với 1 nến MUA & 2 nến BÁN, nếu thua, mua 20, nếu vẫn thua, mua lại 40, nếu vẫn thua, mua lại 10.

// // * Số tiền mua - bán của Multple khi thua:
// // /script__D123719__2b_b2l2 - Mua 2 khi chuỗi tín hiệu kết thúc với 2 nến MUA, nếu thua, mua số tiền x 2. Đặt lại số tiền mua thành 2 khi thắng.

// // * Số tiền mua - bán của Multple khi thắng:
// // /script__D123719__3s_s1w2 - Bán 1 khi chuỗi tín hiệu kết thúc với 3 nến BÁN, nếu thắng, số tiền bán x 2. Đặt lại số tiền bán thành 1 khi thua.

// console.log('autoTrade', autoTrade);
// console.log('amount', autoTrade.amount, '  || betType: ', autoTrade.betType);
