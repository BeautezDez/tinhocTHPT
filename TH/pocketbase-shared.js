/* pocketbase-shared.js — Cấu hình PocketBase DÙNG CHUNG cho toàn bộ nhánh TH
   (mọi Khối/Bài). KHÔNG hardcode URL trong file này — link PocketBase (qua
   Cloudflare Quick Tunnel) đổi mỗi lần laptop/tunnel khởi động lại, nên được
   lấy động từ Vercel Serverless Function `/api/pb-url` (đọc biến môi trường
   POCKETBASE_URL). Khi cần đổi link, chỉ sửa biến môi trường trên Vercel
   Dashboard rồi Redeploy — không cần sửa file này.

   File này KHÔNG chứa BAI_ID — mỗi trang HTML của từng bài tự khai báo
   `const BAI_ID = 'khoi11-bai5';` (1 dòng) NGAY TRƯỚC khi nạp file này.

   === THAY ĐỔI SO VỚI BẢN CŨ ===
   1. Collection `assignments` mới: mỗi bài có 1 bản ghi riêng chứa `han_nop`
      (deadline) — dùng để tự động đánh dấu nộp trễ.
   2. Collection `submissions` có thêm `lan_nop_thu` (số thứ tự) — mỗi lần
      nộp lại tạo bản ghi MỚI thay vì ghi đè, giữ trọn lịch sử nộp bài.
   3. Hàm `submitAssignment()` tự tính `la_nop_tre` bằng cách so sánh giờ nộp
      với `han_nop` lấy từ `assignments`, không cần gõ tay. */

if (typeof BAI_ID === 'undefined') {
  console.error('BAI_ID chưa được khai báo — thêm dòng `const BAI_ID = \'...\';` trước khi nạp pocketbase-shared.js');
}

let pb = null;
let pbReadyPromise = null;

/* Gọi 1 lần, cache lại Promise để mọi hàm khác (login, submit, load...) đều
   "chờ" cùng 1 lần khởi tạo thay vì tự fetch nhiều lần. */
function getPocketBase() {
  if (pbReadyPromise) return pbReadyPromise;

  pbReadyPromise = (async () => {
    try {
      const res = await fetch('/api/pb-url');
      const data = await res.json();

      if (!data.configured || !data.url) {
        console.error('Chưa cấu hình POCKETBASE_URL trên Vercel:', data.message);
        return null;
      }

      if (typeof window === 'undefined' || !window.PocketBase) {
        console.error('Thư viện PocketBase SDK chưa được nạp (thiếu <script> pocketbase.umd.js).');
        return null;
      }

      pb = new PocketBase(data.url);
      return pb;
    } catch (e) {
      console.error('Không lấy được link PocketBase từ /api/pb-url:', e);
      return null;
    }
  })();

  return pbReadyPromise;
}

/* ---------- Session học sinh: lưu vào localStorage riêng theo BAI_ID ---------- */

const SessionManager = {
  key: `thuchanh-session-${typeof BAI_ID !== 'undefined' ? BAI_ID : 'unknown'}`,
  save(studentId, hoTen, lop) {
    localStorage.setItem(this.key, JSON.stringify({ studentId, hoTen, lop }));
  },
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  clear() {
    localStorage.removeItem(this.key);
  }
};

/* ---------- Đăng nhập học sinh (so khớp thủ công trong collection Base) ----------
   Lưu ý bảo mật: mật khẩu học sinh lưu dạng text thường trong PocketBase, chấp
   nhận được cho mô hình lớp học nội bộ (không phải hệ thống ngân hàng). */

async function loginStudent(hoTen, lop, password) {
  const client = await getPocketBase();
  if (!client) return { success: false, message: 'Chưa kết nối được tới máy chủ. Liên hệ giáo viên.' };

  try {
    const result = await client.collection('students').getFirstListItem(
      `ho_ten="${hoTen}" && lop="${lop}"`
    );
    if (result.password !== password) {
      return { success: false, message: 'Sai mật khẩu.' };
    }
    return { success: true, student_id: result.id };
  } catch (e) {
    return { success: false, message: 'Không tìm thấy tài khoản. Liên hệ giáo viên để được cấp.' };
  }
}

/* ---------- Đăng nhập giáo viên/admin (dùng tài khoản Admin gốc của PocketBase) ---------- */

async function loginAdmin(email, password) {
  const client = await getPocketBase();
  if (!client) return { success: false, message: 'Chưa kết nối được tới máy chủ.' };

  try {
    await client.admins.authWithPassword(email, password);
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Sai tài khoản hoặc mật khẩu.' };
  }
}

/* ---------- Lấy thông tin đề bài (đề bài, file mẫu, hạn nộp) ---------- */

async function getAssignmentInfo() {
  const client = await getPocketBase();
  if (!client) return null;

  try {
    return await client.collection('assignments').getFirstListItem(`bai_id="${BAI_ID}"`);
  } catch (e) {
    console.warn('Chưa có bản ghi assignments cho bài này — nộp bài vẫn hoạt động nhưng không tính được hạn nộp/nộp trễ.');
    return null;
  }
}

/* ---------- Nộp bài thực hành ----------
   Mỗi lần nộp tạo 1 bản ghi MỚI (không ghi đè), tăng dần lan_nop_thu, để giữ
   trọn lịch sử. Trang xem bài nộp (admin/giáo viên) tự lấy bản ghi có
   lan_nop_thu lớn nhất làm bài "chính thức" mới nhất. */

async function submitAssignment({ studentId, hoTen, lop, file, note }) {
  const client = await getPocketBase();
  if (!client) return { success: false, message: 'Chưa kết nối được tới máy chủ. Liên hệ giáo viên.' };

  try {
    // Đếm xem học sinh đã nộp bài này bao nhiêu lần để tính lần nộp kế tiếp
    const previous = await client.collection('submissions').getList(1, 1, {
      filter: `bai_id="${BAI_ID}" && student_id="${studentId}"`,
      sort: '-lan_nop_thu'
    });
    const lanNopThu = previous.items.length > 0 ? previous.items[0].lan_nop_thu + 1 : 1;

    // Tính nộp trễ hay không dựa vào han_nop của assignments (nếu có)
    let laNopTre = false;
    const assignment = await getAssignmentInfo();
    if (assignment && assignment.han_nop) {
      laNopTre = new Date() > new Date(assignment.han_nop);
    }

    const formData = new FormData();
    formData.append('bai_id', BAI_ID);
    formData.append('student_id', studentId);
    formData.append('ho_ten', hoTen);
    formData.append('lop', lop);
    formData.append('file', file);
    formData.append('lan_nop_thu', lanNopThu);
    formData.append('la_nop_tre', laNopTre);
    if (note) formData.append('note', note);

    await client.collection('submissions').create(formData);

    return { success: true, lanNopThu, laNopTre };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Nộp bài thất bại. Kiểm tra định dạng/dung lượng file rồi thử lại.' };
  }
}

/* ---------- Lấy lịch sử nộp bài của 1 học sinh (mới nhất trước) ---------- */

async function getMySubmissions(studentId) {
  const client = await getPocketBase();
  if (!client) return [];

  try {
    const result = await client.collection('submissions').getList(1, 50, {
      filter: `bai_id="${BAI_ID}" && student_id="${studentId}"`,
      sort: '-lan_nop_thu'
    });
    return result.items;
  } catch (e) {
    console.error(e);
    return [];
  }
}
