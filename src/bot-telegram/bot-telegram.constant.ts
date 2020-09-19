export const HELP_TXT = `
Chào. Bạn có thể sử dụng Bot bằng cách gửi các lệnh sau:\n\
/login - Hiển thị cách đăng nhập để bắt đầu.\n\
/help - Hiển thị hướng dẫn này.
/lang_en - Chuyển ngôn ngữ sang tiếng Anh.
/lang_vi - Chuyển qua tiếng Việt.
/profit_day - Báo cáo lợi nhuận của ngày hôm nay.
/profit_month - Báo cáo lợi nhuận từ đầu tháng đến hôm nay.
/profit_all - Báo cáo lợi nhuận mọi thời điểm.
/show - Hiển thị các lệnh đã thêm.
/stop - Dừng tự động đặt lệnh mà không có điều kiện.
/stop_l100 - Dừng tự động đặt lệnh khi số dư hiện tại nhỏ hơn 100 đô la. Thay 100 bằng số mà bạn muốn.
/stop_h100 - Ngừng đặt lệnh tự động khi số dư hiện tại lớn hơn $ 100. Thay 100 bằng số mà bạn muốn.
/trade - Tiếp tục lệnh đặt tự động và xóa tất cả các điều kiện dừng.
  
  Đặt chuỗi tín hiệu gửi:
/2b - Gửi khi kết thúc bằng 2 nến MUA.
/2 giây - Gửi khi kết thúc bằng 2 nến BÁN.
/2b2s - Gửi khi nó kết thúc với 2 nến MUA & 2 nến BÁN.
  
  Đặt đơn đặt hàng tự động:
/2b_b10 - Mua 10 khi chuỗi tín hiệu kết thúc với 2 nến MUA.
/3s_s20 - Bán 20 khi chuỗi tín hiệu kết thúc với 3 nến BÁN.
/1b2s_b10b20b40 - Mua 10 khi chuỗi tín hiệu kết thúc với 1 nến MUA & 2 nến BÁN, nếu thua, mua 20, nếu vẫn thua, mua lại 40, nếu vẫn thua, mua lại 10.
    Trong trường hợp thắng, lệnh đặt tự động sẽ bắt đầu lại bằng cách mua 10 khi chuỗi tín hiệu kết thúc với 1 nến MUA & 2 nến BÁN vào lần sau.
/3s1b_s5s10s15w - Bán 5 khi chuỗi tín hiệu kết thúc với 3 nến BÁN & 1 nến MUA, nếu thắng, bán 10, nếu vẫn thắng, bán 15, nếu vẫn thắng, Mua lại 5.
    Trong trường hợp thua, lệnh đặt tự động sẽ bắt đầu lại bằng cách bán 5 khi chuỗi tín hiệu kết thúc với 3 nến BÁN & 1 nến MUA vào lần sau.
  
  * Thêm e (chính xác) trước lệnh đặt lệnh tự động:
/e2b_b10b20b40b80 - Mua 10 khi chuỗi tín hiệu kết thúc với 2 nến MUA, nếu thua, chờ chuỗi tín hiệu kết thúc với 2 nến MUA vào lần tiếp theo thì mua 20.
    Cứ tiếp tục như vậy cho đến khi thắng.
/e3s_s5s10s15s20w - Bán 5 khi chuỗi tín hiệu kết thúc với 3 nến BÁN, nếu thắng, giao dịch cho chuỗi tín hiệu kết thúc với 3 nến BÁN vào lần tiếp theo thì bán 10.
    Cứ tiếp tục như vậy cho đến khi thua cuộc.
  
  * Số tiền mua - bán của Multple khi thua:
/2b_b2l2 - Mua 2 khi chuỗi tín hiệu kết thúc với 2 nến MUA, nếu thua, mua số tiền x 2. Đặt lại số tiền mua thành 2 khi thắng.
  
  * Số tiền mua - bán của Multple khi thắng:
/3s_s1w2 - Bán 1 khi chuỗi tín hiệu kết thúc với 3 nến BÁN, nếu thắng, số tiền bán x 2. Đặt lại số tiền bán thành 1 khi thua.
  
  * Thêm e (chính xác) trước nhiều lệnh mua - bán số tiền:
  Tương tự như 2 lệnh trên, nhưng chỉ mua, bán khi chuỗi tín hiệu khớp.
/e2b_b2l2
/e3s_s1w2
  
  * LƯU Ý: Lệnh if có phần tín hiệu trùng với phần tín hiệu của lệnh đã đặt trước đó. Tự động đặt một phần của lệnh mới sẽ thay thế cho lệnh đã đặt trước đó và trạng thái đặt lại.
`;

export const MESSAGES = {
  LOGIN_FAIL: 'ERROR! MẬT KHẨU HOẶC TÀI KHOẢN KHÔNG ĐÚNG',
};
