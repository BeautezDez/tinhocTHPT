// api/pb-url.js — Vercel Serverless Function
// Trả về link PocketBase (Cloudflare Quick Tunnel) hiện tại, đọc từ biến môi trường.
// Mỗi lần Quick Tunnel đổi link (restart laptop/tunnel), vào Vercel Dashboard →
// Settings → Environment Variables → sửa POCKETBASE_URL → Redeploy. Không cần sửa code.

export default function handler(req, res) {
  const url = process.env.POCKETBASE_URL || '';

  if (!url) {
    res.status(200).json({
      url: '',
      configured: false,
      message: 'Chưa cấu hình POCKETBASE_URL trong Vercel Environment Variables.'
    });
    return;
  }

  // Cache rất ngắn để tránh gọi quá nhiều nhưng vẫn cập nhật nhanh sau khi đổi link
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=59');
  res.status(200).json({ url, configured: true });
}
