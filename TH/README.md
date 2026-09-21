# Hệ thống Thực hành (nhánh TH) — Web trên Vercel, Database trên laptop

**Kiến trúc:**
- **Website (LT + TH)**: deploy tĩnh lên Vercel — domain cố định
  `xxx.vercel.app`, không đổi.
- **Database (PocketBase)**: chạy trên laptop của bạn, expose ra Internet
  qua **Cloudflare Quick Tunnel** (miễn phí, nhưng link đổi mỗi lần khởi
  động lại).
- **Cầu nối**: 1 serverless function `api/pb-url.js` trên Vercel đọc biến môi
  trường `POCKETBASE_URL` — mỗi lần tunnel đổi link, chỉ cần sửa biến này trên
  Vercel Dashboard rồi Redeploy, không cần sửa code, học sinh không cần biết
  link tunnel thay đổi.

Học sinh **không tự đăng ký** — bạn tự thêm tài khoản (họ tên, lớp, mật khẩu)
qua Admin UI của PocketBase, dùng **chung 1 tài khoản cho mọi bài thực hành**
trong năm học (khác với thiết kế cũ, không cần tạo lại tài khoản mỗi bài).

Trang `/admin` của mỗi bài yêu cầu đăng nhập bằng tài khoản Admin gốc của
PocketBase — đây cũng là tài khoản giáo viên dùng để xem/tải bài nộp.

## Thứ tự làm

1. **`SELFHOST-SETUP.md`** — cài PocketBase + Quick Tunnel trên laptop, deploy
   web lên Vercel, nối 2 bên qua biến môi trường. Đọc file này trước, làm theo
   từng phần A → B → C → D.
2. **`POCKETBASE-COLLECTIONS.md`** — tạo các collection (`students`,
   `assignments`, `submissions`) qua Admin UI của PocketBase, cách thêm học
   sinh và mở bài thực hành mới kèm hạn nộp.

## Cấu trúc thư mục liên quan

```
/
├── api/
│   └── pb-url.js              ← Serverless function, đọc biến môi trường POCKETBASE_URL
├── vercel.json                ← Config để Vercel nhận diện đúng site tĩnh + API
└── TH/
    ├── SELFHOST-SETUP.md          ← Đọc trước — hướng dẫn đầy đủ
    ├── POCKETBASE-COLLECTIONS.md  ← Đọc sau — tạo cấu trúc dữ liệu
    ├── pocketbase-shared.js       ← Không cần sửa gì trong file này
    └── Khoi11/
        └── Bai5/
            ├── index.html      (đăng nhập học sinh)
            ├── nop-bai.html    (nộp bài, hiện hạn nộp + lịch sử nộp)
            ├── admin.html      (giáo viên xem danh sách, lọc theo trạng thái)
            └── style.css
```

Mỗi trang trong `Khoi11/Bai5/*.html` chỉ khai báo 1 dòng riêng rồi nạp file chung:

```html
<script>const BAI_ID = 'khoi11-bai5';</script>
<script src="../../pocketbase-shared.js"></script>
```

`pocketbase-shared.js` tự động gọi `/api/pb-url` để lấy link PocketBase hiện
tại — không hardcode URL trong code, nên không cần sửa file này khi tunnel đổi
link.

## Những gì đã thay đổi so với bản đầu tiên

| Trước | Giờ |
|---|---|
| Mỗi bài có `bai_id` riêng gắn chặt với `students` — phải thêm lại học sinh cho mỗi bài mới | Tài khoản học sinh **dùng chung cho mọi bài**, chỉ cần thêm 1 lần |
| Không có khái niệm hạn nộp | Collection `assignments` mới, khai báo `han_nop`, tự tính nộp trễ |
| Nộp lại = không rõ ràng, dễ mất dữ liệu cũ | Mỗi lần nộp tạo bản ghi mới (`lan_nop_thu` tăng dần) — **giữ trọn lịch sử** |
| API Rules để trống hoàn toàn — bất kỳ ai cũng đọc được toàn bộ dữ liệu | Vẫn để trống theo đúng bản chất PocketBase Base collection (đơn giản, phù hợp mô hình lớp học nội bộ), nhưng **đã tách bạch rõ theo `bai_id`** ở tầng ứng dụng để tránh lẫn lộn dữ liệu giữa các bài |
| Trang admin chỉ xem thô | Có bộ lọc theo họ tên / lớp / trạng thái (đúng hạn, trễ hạn) / xem toàn bộ lịch sử hay chỉ bài mới nhất |

## Thêm bài thực hành mới (vd Bài 6)

1. Vào Admin UI PocketBase → collection `assignments` → tạo bản ghi mới:
   `bai_id = 'khoi11-bai6'`, `khoi = '11'`, `tieu_de`, `han_nop`.
2. Copy thư mục `TH/Khoi11/Bai5/` thành `TH/Khoi11/Bai6/`.
3. Trong cả 3 file HTML, đổi dòng `const BAI_ID = 'khoi11-bai5';` thành `'khoi11-bai6'`.
4. Đường dẫn `src="../../pocketbase-shared.js"` giữ nguyên.
5. Không cần thêm lại học sinh — tài khoản dùng chung cho mọi bài.
6. Push code lên GitHub — Vercel tự deploy lại (không cần đổi `POCKETBASE_URL`,
   vì tất cả các bài dùng chung 1 PocketBase, 1 tunnel).

## Nhánh Thực hành Excel (TH/Khoi10)

Cấu trúc khác một chút so với Bài 5: mỗi Tuần có `ly-thuyet.html` (hiện lý
thuyết Excel trên web) + `bai-tap.html` (tải file .xlsx + hướng dẫn công thức
từng câu) + `dang-nhap.html` + `nop-bai.html`. `bai_id` dùng cho 3 tuần là
`excel-tuan1`, `excel-tuan2`, `excel-tuan3` — mỗi tuần vẫn cần 1 bản ghi riêng
trong `assignments` để khai báo hạn nộp riêng, nhưng học sinh **không cần**
tài khoản riêng cho từng tuần.

Trang `TH/Khoi10/admin.html` có thêm ô chọn Tuần (dropdown) để lọc đúng danh
sách bài nộp theo từng tuần, thay vì làm 3 trang admin riêng.

## Việc cần làm mỗi khi bắt đầu đợt nộp bài mới

Vì Quick Tunnel đổi link mỗi lần khởi động lại, quy trình lặp lại là:

1. Bật laptop, đảm bảo PocketBase đang chạy nền (đã cài `systemd`, tự chạy).
2. Chạy lại `cloudflared tunnel --url http://127.0.0.1:8090`, copy link mới in ra.
3. Vào Vercel → Settings → Environment Variables → sửa `POCKETBASE_URL` → Redeploy.
4. Xong. Học sinh vào đúng domain Vercel cũ, không cần link mới.

Nếu tunnel không bị ngắt giữa chừng (laptop không tắt, mạng ổn định), không
cần lặp lại — chỉ cần làm lại khi tunnel chết.

## Vận hành — điều bắt buộc phải nhớ

- **Laptop phải bật + tunnel phải sống** khi học sinh cần nộp bài. Web (trên
  Vercel) luôn truy cập được, nhưng đăng nhập/nộp bài sẽ báo lỗi nếu PocketBase
  hoặc tunnel đang tắt.
- **Backup định kỳ, quan trọng nhất.** Toàn bộ dữ liệu nằm trong
  `~/pocketbase/pb_data/` trên laptop — không có bản sao ở nơi khác. Nên đặt
  lịch backup hàng tuần ra ổ cứng ngoài hoặc Google Drive.
- Mật khẩu học sinh lưu dạng text thường trong PocketBase (không băm, vì dùng
  collection kiểu Base để đơn giản hoá) — chấp nhận được cho mô hình lớp học
  nội bộ, không phải hệ thống bảo mật cấp doanh nghiệp. Xem
  `POCKETBASE-COLLECTIONS.md` mục cuối nếu muốn nâng cấp lên băm mật khẩu.
