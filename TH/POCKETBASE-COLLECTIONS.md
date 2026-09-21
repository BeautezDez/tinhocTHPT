# Tạo Collections trong PocketBase

PocketBase không dùng SQL trực tiếp — tạo cấu trúc dữ liệu qua Admin UI
(`https://<link-tunnel>/_/`). Làm theo đúng thứ tự dưới đây, **chỉ cần làm 1
lần** cho toàn hệ thống (mọi Khối/Bài dùng chung 4 collection này).

## 1. Collection `students`

New collection → tên `students`, loại **Base**.

| Tên field | Loại | Bắt buộc | Ghi chú |
|---|---|---|---|
| `ho_ten` | Text | ✓ | |
| `lop` | Text | ✓ | vd `11A1` |
| `password` | Text | ✓ | lưu dạng text thường — xem lưu ý bảo mật cuối file |

API Rules:
- **List/Search rule**: để trống (cần thiết để kiểm tra đăng nhập)
- **View rule**: để trống
- **Create/Update/Delete rule**: `false` cho cả 3 (chỉ admin thêm học sinh qua Admin UI)

> **Khác với bản cũ**: bỏ field `bai_id` khỏi `students`. Một học sinh giờ có
> **1 tài khoản duy nhất dùng chung cho mọi bài** (không phải tạo lại tài
> khoản mỗi khi thêm bài mới) — việc "bài nào thuộc lớp nào" chuyển sang quản
> lý ở collection `assignments` bên dưới.

## 2. Collection `assignments` (MỚI — không có trong bản cũ)

New collection → tên `assignments`, loại **Base**. Đây là nơi khai báo **hạn
nộp** cho từng bài, để hệ thống tự động đánh dấu nộp trễ.

| Tên field | Loại | Bắt buộc | Ghi chú |
|---|---|---|---|
| `bai_id` | Text | ✓ | vd `khoi11-bai5`, phải khớp `BAI_ID` khai trong HTML |
| `khoi` | Text | ✓ | vd `11` |
| `tieu_de` | Text | ✓ | vd "Bài 5 — Mạng máy tính" |
| `han_nop` | Date | ✓ | Bật cả ngày + giờ. Sau thời điểm này, bài nộp tự bị đánh dấu "nộp trễ" |
| `file_de_bai` | File | ✗ | file đề bài mẫu (nếu có) để học sinh tải về làm |

API Rules:
- **List/Search rule**: để trống (học sinh cần đọc để biết hạn nộp)
- **View rule**: để trống
- **Create/Update/Delete rule**: `false` (chỉ admin sửa qua Admin UI)

**Mỗi khi mở 1 bài thực hành mới**: vào đây tạo 1 bản ghi, đặt đúng `bai_id`
và `han_nop`. Nếu quên tạo, hệ thống vẫn cho nộp bài bình thường nhưng sẽ
không đánh dấu được nộp trễ (mặc định coi là đúng hạn).

## 3. Collection `submissions`

New collection → tên `submissions`, loại **Base**.

| Tên field | Loại | Bắt buộc | Ghi chú |
|---|---|---|---|
| `bai_id` | Text | ✓ | |
| `student_id` | Text | ✓ | id bản ghi trong `students` |
| `ho_ten` | Text | ✓ | lưu kèm để hiển thị nhanh không cần join |
| `lop` | Text | ✓ | |
| `file` | File | ✓ | Max Select = 1; giới hạn định dạng `docx, xlsx, pptx`; Max size ~20MB |
| `lan_nop_thu` | Number | ✓ | 1, 2, 3... — tăng dần mỗi lần học sinh nộp lại |
| `la_nop_tre` | Bool | ✓ | tự động tính khi nộp, so với `han_nop` của `assignments` |
| `note` | Text | ✗ | ghi chú tuỳ chọn |

API Rules:
- **List/Search rule**: để trống (học sinh xem bài mình đã nộp, giáo viên xem tất cả)
- **View rule**: để trống
- **Create rule**: để trống (cho phép nộp không cần đăng nhập PocketBase riêng — hệ thống tự quản lý đăng nhập học sinh ở tầng ứng dụng)
- **Update/Delete rule**: `false` (không cho sửa/xoá bài đã nộp qua API công khai — muốn "nộp lại" thì tạo bản ghi mới, xem `pocketbase-shared.js`)

> **Khác với bản cũ**: thêm `lan_nop_thu` và `la_nop_tre`. Nộp lại KHÔNG xoá/
> ghi đè bài cũ — luôn tạo bản ghi mới với `lan_nop_thu` tăng dần, nên toàn bộ
> lịch sử nộp bài được giữ lại. Khi xem "bài nộp hiện tại" của 1 học sinh, lấy
> bản ghi có `lan_nop_thu` lớn nhất (sort `-lan_nop_thu`, lấy dòng đầu).

## 4. Đăng nhập Admin/Giáo viên — dùng tài khoản Admin có sẵn của PocketBase

Không cần tạo collection riêng cho admin. Trang `admin.html` gọi thẳng API
đăng nhập admin có sẵn của PocketBase (`pb.admins.authWithPassword(...)`) —
dùng chính email + mật khẩu Admin bạn tạo lúc cài đặt PocketBase lần đầu.

Nếu có nhiều giáo viên cần xem bài nộp, tạo thêm nhiều tài khoản Admin qua
Admin UI (Settings → Admins → New admin) — mỗi giáo viên 1 tài khoản riêng,
tất cả đều xem được toàn bộ `submissions` (PocketBase không phân quyền chi
tiết theo lớp giữa các Admin; nếu cần tách quyền theo lớp giữa các giáo viên,
báo lại để nâng cấp thêm collection `teachers` riêng).

## 5. Thêm học sinh thủ công

Vào Admin UI → collection `students` → **New record**, điền `ho_ten`, `lop`,
`password`. Lặp lại cho từng học sinh, hoặc dùng nút **Import** (CSV) với 3
cột `ho_ten, lop, password` để thêm hàng loạt.

## 6. Thêm bài thực hành mới

1. Tạo 1 bản ghi trong `assignments` (bước 2) với `bai_id` mới và `han_nop`.
2. Copy thư mục `TH/Khoi11/Bai5/` thành `TH/Khoi11/BaiX/`.
3. Trong các file HTML, đổi dòng `const BAI_ID = 'khoi11-bai5';` thành `bai_id` mới vừa tạo.
4. Không cần thêm lại học sinh — tài khoản dùng chung cho mọi bài (khác bản cũ).

## Lưu ý bảo mật

Mật khẩu học sinh lưu dạng **text thường** (không băm) trong collection
`students`, vì PocketBase Base collection không tự băm password như collection
kiểu Auth. Chấp nhận được cho mô hình lớp học nội bộ, không phải hệ thống
ngân hàng. Có thể nâng cấp lên collection kiểu **Auth** sau nếu cần chặt hơn.
