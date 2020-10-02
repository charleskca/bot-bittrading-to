import * as moment from 'moment';

export const HELP_TXT = `
<b>GREEN TEAM BOT</b> bản Free cho members
Chào. Bạn có thể sử dụng Bot bằng cách gửi các lệnh sau:\n\
[username] === tài khoản của bạn, vd: /trade__[username] === /trade__D000001 \n\
__ là 2 dấu _
/login - Hiển thị cách đăng nhập để bắt đầu.\n\
/help - Hiển thị hướng dẫn này.
/info - Hiển thị các tài khoản đã đăng nhập và trang thái tài khoản
/profit_day__[username] - Báo cáo lợi nhuận của ngày hôm nay.
/profit_week__[username] - Báo cáo lợi nhuận của tuần này.
/profit_month__[username] - Báo cáo lợi nhuận từ đầu tháng đến hôm nay.
/profit_all__[username] - Báo cáo lợi nhuận mọi thời điểm.
/stop__[username] - Dừng tự động đặt lệnh mà không có điều kiện.
/stop_l100 - Dừng tự động đặt lệnh khi số dư hiện tại nhỏ hơn 100 đô la. Thay 100 bằng số mà bạn muốn.
/stop_h100 - Ngừng đặt lệnh tự động khi số dư hiện tại lớn hơn $ 100. Thay 100 bằng số mà bạn muốn.
/trade__[username] - Tiếp tục lệnh đặt tự động và xóa tất cả các điều kiện dừng.
/script__[username]__[đoạn kịch bản của bạn] thiết lập kịch bản của bạn vd: /script__D000001__2b

Xem các chuỗi tín hiệu có sẵn:
/show_script_default__[username]

<b>Bot tạo bởi dongnguyenvie@gmail.com</b>
* LƯU Ý: Bot đang trong thời gian thử nghiệm, liên hệ mình khi có vấn đề 0347.884.884
`;

export const SCRIPT_HELP_TXT = username => `
Đặt chuỗi tín hiệu gửi:
2b - Gửi khi kết thúc bằng 2 nến MUA.
2 giây - Gửi khi kết thúc bằng 2 nến BÁN.
2b2s - Gửi khi nó kết thúc với 2 nến MUA & 2 nến BÁN.
  
  Đặt đơn đặt hàng tự động:
/script__${username}__2b_b10 - Mua 10 khi chuỗi tín hiệu kết thúc với 2 nến MUA. <b>(✔)</b>
/script__${username}__3s_s20 - Bán 20 khi chuỗi tín hiệu kết thúc với 3 nến BÁN. <b>(✔)</b>
/script__${username}__1b2s_b10b20b40 - Mua 10 khi chuỗi tín hiệu kết thúc với 1 nến MUA & 2 nến BÁN, nếu thua, mua 20, nếu vẫn thua, mua lại 40, nếu vẫn thua, mua lại 10.
    Trong trường hợp thắng, lệnh đặt tự động sẽ bắt đầu lại bằng cách mua 10 khi chuỗi tín hiệu kết thúc với 1 nến MUA & 2 nến BÁN vào lần sau.
/script__${username}__3s1b_s5s10s15w - Bán 5 khi chuỗi tín hiệu kết thúc với 3 nến BÁN & 1 nến MUA, nếu thắng, bán 10, nếu vẫn thắng, bán 15, nếu vẫn thắng, Mua lại 5.
    Trong trường hợp thua, lệnh đặt tự động sẽ bắt đầu lại bằng cách bán 5 khi chuỗi tín hiệu kết thúc với 3 nến BÁN & 1 nến MUA vào lần sau.
  
  * Thêm e (chính xác) trước lệnh đặt lệnh tự động:
/script__${username}__e2b_b10b20b40b80 - Mua 10 khi chuỗi tín hiệu kết thúc với 2 nến MUA, nếu thua, chờ chuỗi tín hiệu kết thúc với 2 nến MUA vào lần tiếp theo thì mua 20.
    Cứ tiếp tục như vậy cho đến khi thắng.
/script__${username}__e3s_s5s10s15s20w - Bán 5 khi chuỗi tín hiệu kết thúc với 3 nến BÁN, nếu thắng, giao dịch cho chuỗi tín hiệu kết thúc với 3 nến BÁN vào lần tiếp theo thì bán 10.
    Cứ tiếp tục như vậy cho đến khi thua cuộc.
  
  * Số tiền mua - bán của Multple khi thua:
/script__${username}__2b_b2l2 - Mua 2 khi chuỗi tín hiệu kết thúc với 2 nến MUA, nếu thua, mua số tiền x 2. Đặt lại số tiền mua thành 2 khi thắng.
  
  * Số tiền mua - bán của Multple khi thắng:
/script__${username}__3s_s1w2 - Bán 1 khi chuỗi tín hiệu kết thúc với 3 nến BÁN, nếu thắng, số tiền bán x 2. Đặt lại số tiền bán thành 1 khi thua.
  
  * Thêm e (chính xác) trước nhiều lệnh mua - bán số tiền:
  Tương tự như 2 lệnh trên, nhưng chỉ mua, bán khi chuỗi tín hiệu khớp.
/script__${username}__e2b_b2l2
/script__${username}__e3s_s1w2
  
  * LƯU Ý: Lệnh if có phần tín hiệu trùng với phần tín hiệu của lệnh đã đặt trước đó. Tự động đặt một phần của lệnh mới sẽ thay thế cho lệnh đã đặt trước đó và trạng thái đặt lại.
`;

export const MESSAGES = {
  LOGIN_FAIL: 'ERROR! MẬT KHẨU HOẶC TÀI KHOẢN KHÔNG ĐÚNG',
};

export const AUTO_TRADE_LABEL = isAuto => (isAuto ? 'Bật' : 'Tắt');

export const INFO_TEMPLATE = player => `
tài khoản: <b>${player.accountName}</b>
script: ${player.script || 'Chưa thiết lập'},
chế độ auto trade: ${AUTO_TRADE_LABEL(player.isAuto)}
/suggest__${player.accountName} Đề xuất các setup của tài khoản nhanh
===========
`;

export const UPDATE_SCRIPT_TEMPLATE_SUCCESS_TEMPLATE = (accountNm, script) => `
Kịch bản của tài khoản <b>${accountNm}</b> được cập nhập thành: ${script}
===========
`;

export const AUTO_TRADE_STATUS_TEMPLATE = (accountName, isAuto) => `
tài khoản: <b>${accountName}</b>
chế độ auto trade: <b>${AUTO_TRADE_LABEL(isAuto)}</b>
`;

export const SUGGEST_TEMPLATE = accountName => `
/show_script_default__${accountName}
/profit_day__${accountName} - Báo cáo lợi nhuận của ngày hôm nay.
/profit_week__${accountName} - Báo cáo lợi nhuận từ đầu tháng đến hôm nay.
/profit_month__${accountName} - Báo cáo lợi nhuận từ đầu tháng đến hôm nay.
/stop__${accountName} - Dừng tự động đặt lệnh mà không có điều kiện.
/trade__${accountName} - Tiếp tục lệnh đặt tự động và xóa tất cả các điều kiện dừng.
/script__${accountName}__[đoạn kịch bản của bạn] thiết lập kịch bản của bạn vd: /script__D000001__2b
`;
// /profit_all__${accountName} - Báo cáo lợi nhuận mọi thời điểm.

export const ACCOUNT_DONT_HAVE_SCRIPT = accountName => `
Tài khoản ${accountName} chưa setup (script) kịch bản
Vui lòng setup script trước khi bật tính năng auto trade
/show_script_default__${accountName}
/script__${accountName}__[đoạn kịch bản của bạn] thiết lập kịch bản của bạn vd: /script__D000001__2b
`;

export const PROFIT_TODAY_SUCCESS_TEMPLATE = (accountName, data) => `
Profit report <b>${accountName}</b>: ${moment(data.FromDate).format('DD/MM/YYYY')}
- Begin: $${data.data.total.begin}
- Waiting: $${data.data.total.waiting}
- Deposit: $${data.data.total.deposit}
- Withdraw: $${data.data.total.withdraw}
- Profit: $${data.data.total.profit}
- Balance: $${data.data.total.balance}
`;

export const PROFIT_MONTH_SUCCESS_TEMPLATE = (accountName, data) => `
Profit report <b>${accountName}</b>: ${moment(data.FromDate).format('DD/MM/YYYY')} - ${moment(data.ToDate).format('DD/MM/YYYY')}
- Begin: $${data.data.total.begin}
- Waiting: $${data.data.total.waiting}
- Deposit: $${data.data.total.deposit}
- Withdraw: $${data.data.total.withdraw}
- Profit: $${data.data.total.profit}
- Balance: $${data.data.total.balance}
`;

export const BOT_ERROR_MESSAGE_TEMPLATE = `
Chức năng bị lỗi, xin hãy thử lại sau,
hoặc có thể báo cho dongnguyenvie@gmail.com
`;

export const GET_PROFILE_BOT_TEMPLATE = data => `
id: ${data.id},
is_bot: ${data.is_bot},
first_name: ${data.first_name},
last_name: ${data.last_name},
username: ${data.username},
language_code: ${data.language_code}
`;

export const SIGNAL_TEMPLATE = data => data.map(isBuy => (isBuy === 1 ? '🍏' : '🍎')).join(' ');
