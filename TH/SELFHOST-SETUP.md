# Setup: Web trên Vercel + Database (PocketBase) trên laptop

Kiến trúc: **website tĩnh (LT + TH)** deploy lên Vercel — có domain cố định
`xxx.vercel.app`, học sinh bookmark dùng mãi không đổi. **Database** (PocketBase)
chạy trên laptop của bạn, expose ra Internet qua **Cloudflare Quick Tunnel**
— miễn phí hoàn toàn nhưng link tunnel đổi mỗi lần khởi động lại. 1 serverless
function nhỏ trên Vercel (`api/pb-url.js`) đọc link tunnel hiện tại từ biến
môi trường, nên mỗi lần tunnel đổi link, bạn chỉ cần sửa 1 biến trên Vercel
Dashboard — không phải sửa code, không phải gửi lại link cho học sinh.

⚠️ **Đánh đổi đã biết và được chấp nhận**: vì database chạy trên laptop cá
nhân (không phải server luôn bật 24/7), hệ thống sẽ **không nộp bài được**
nếu laptop tắt, mất mạng, hoặc tunnel bị ngắt giữa chừng. Đây là lựa chọn có
chủ đích để giữ chi phí bằng 0 — nếu sau này cần độ ổn định cao hơn (VD nộp
bài đồng loạt vào giờ cố định, không được phép lỗi), cân nhắc chuyển
PocketBase sang 1 VPS nhỏ (~$5/tháng, luôn online) mà không cần đổi code, chỉ
đổi nơi chạy lệnh `./pocketbase serve`.

## Phần A — Cài PocketBase trên laptop (làm 1 lần)

```bash
mkdir -p ~/pocketbase && cd ~/pocketbase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase
./pocketbase serve --http=127.0.0.1:8090
```

Mở `http://127.0.0.1:8090/_/` trên chính laptop, tạo tài khoản Admin đầu tiên
(email + mật khẩu — dùng để đăng nhập trang `admin.html` sau này, cũng chính
là tài khoản giáo viên xem bài nộp). Nhấn `Ctrl+C` để dừng, chuyển sang chạy nền:

```bash
sudo nano /etc/systemd/system/pocketbase.service
```

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/pocketbase
ExecStart=/home/YOUR_USERNAME/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

`enable` đảm bảo PocketBase **tự khởi động lại cùng laptop** nếu laptop khởi
động lại (giảm bớt một phần rủi ro, dù tunnel ở Phần B vẫn cần chạy lại tay
mỗi lần).

Sau đó tạo các collection (`students`, `assignments`, `submissions`) theo
hướng dẫn trong `POCKETBASE-COLLECTIONS.md`.

## Phần B — Cài Cloudflare Quick Tunnel (chạy lại mỗi lần cần link mới)

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

Chạy Quick Tunnel (không cần đăng nhập, không cần domain):

```bash
cloudflared tunnel --url http://127.0.0.1:8090
```

Terminal sẽ in ra dòng dạng:

```
+--------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://random-words-here.trycloudflare.com                                          |
+--------------------------------------------------------------------------------------+
```

**Copy link `https://random-words-here.trycloudflare.com` này** — đây là giá
trị cần điền vào Vercel ở Phần D.

⚠️ Lệnh này chạy ở foreground (chiếm terminal). Để chạy nền lâu dài, dùng:

```bash
nohup cloudflared tunnel --url http://127.0.0.1:8090 > ~/tunnel.log 2>&1 &
```

Xem link đã in ra bằng:

```bash
cat ~/tunnel.log | grep trycloudflare
```

## Phần C — Deploy website lên Vercel (làm 1 lần)

1. Push toàn bộ thư mục này (trừ các file `.md` hướng dẫn nếu muốn gọn) lên 1
   repo GitHub.
2. Vào https://vercel.com → **New Project** → chọn repo vừa tạo → **Deploy**
   (không cần chỉnh build settings gì, vì đây là site tĩnh + 1 serverless function).
3. Sau khi deploy xong, Vercel cấp domain dạng `ten-project.vercel.app` — đây
   là link chính thức gửi cho học sinh, **không đổi** dù bạn deploy lại bao
   nhiêu lần.

## Phần D — Điền link tunnel vào Vercel (làm lại MỖI KHI tunnel đổi link)

1. Vào Vercel Dashboard → chọn project → **Settings → Environment Variables**.
2. Thêm/sửa biến:
   - Name: `POCKETBASE_URL`
   - Value: link tunnel vừa copy ở Phần B (vd `https://random-words-here.trycloudflare.com`)
3. Vào tab **Deployments** → bấm **⋯** trên bản deploy mới nhất → **Redeploy**.

Sau ~30 giây, web sẽ dùng link tunnel mới. Học sinh không cần làm gì, vẫn vào
đúng `ten-project.vercel.app` như cũ.

## Quy trình mỗi lần bắt đầu buổi có học sinh nộp bài

1. Đảm bảo laptop đang bật, PocketBase đang chạy (`systemctl status pocketbase`).
2. Chạy `cloudflared tunnel --url http://127.0.0.1:8090` (hoặc dùng bản nohup ở trên).
3. Copy link tunnel mới in ra.
4. Vào Vercel → sửa `POCKETBASE_URL` → Redeploy.
5. Xong — học sinh vào `ten-project.vercel.app` nộp bài bình thường.

Nếu laptop/tunnel không bị tắt giữa chừng, không cần lặp lại bước 2-4 liên tục
— chỉ cần làm lại khi tunnel bị ngắt (laptop restart, mất mạng, tự đóng...).

## Việc cần làm mỗi khi mở đợt nộp bài mới (bài mới, hạn nộp mới)

1. Vào Admin UI PocketBase → collection `assignments` → tạo bản ghi mới với
   `bai_id`, `khoi`, `tieu_de`, `han_nop` (xem `POCKETBASE-COLLECTIONS.md`).
2. Copy thư mục bài cũ, đổi `BAI_ID` trong các file HTML.
3. Không cần thêm lại học sinh — tài khoản học sinh dùng chung cho mọi bài.

## Lưu ý quan trọng

- **Backup định kỳ** thư mục `~/pocketbase/pb_data/` — đây là nơi duy nhất lưu
  toàn bộ dữ liệu học sinh và file bài nộp. Mất thư mục này là mất tất cả. Nên
  đặt lịch backup hàng tuần ra ổ cứng ngoài hoặc Google Drive
  (`rsync`/`cron` hoặc đơn giản là copy tay).
- **Laptop phải bật + tunnel phải sống** khi học sinh cần nộp bài — nếu tắt
  giữa chừng, học sinh vào web vẫn thấy giao diện (vì web nằm trên Vercel) nhưng
  đăng nhập/nộp bài sẽ báo lỗi "không kết nối được tới máy chủ".
- Mật khẩu học sinh lưu dạng text thường trong PocketBase (không băm) — chấp
  nhận được cho mô hình lớp học nội bộ, không phải hệ thống bảo mật cấp doanh
  nghiệp. Xem `POCKETBASE-COLLECTIONS.md` mục cuối nếu muốn nâng cấp lên băm
  mật khẩu.
- Có thể viết 1 script nhỏ tự động hoá bước 2-4 ở trên (chạy tunnel, đọc link,
  gọi Vercel API cập nhật biến môi trường) nếu muốn đỡ thao tác thủ công mỗi
  lần — hỏi thêm nếu cần.
