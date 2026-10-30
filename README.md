# 💍 Thiệp Cưới Online — Chuẩn Thiết Kế & Cấu Trúc v3

Website thiệp cưới online phong cách **Editorial Wedding** thanh lịch, tone màu sáng (trắng ngà, hồng phấn, be champagne, chữ nâu xám), tối ưu di động với 9 phân đoạn theo đúng trình tự tiêu chuẩn.

---

## 🌟 Trình Tự Hiển Thị Bắt Buộc

1. **01. PHONG BÌ THIỆP MỜI (3D Envelope):** Nắp mở 3D nhẹ, con dấu sáp vàng hồng mờ dần, thiệp trượt lên khi khách chạm *"Nhấp để mở thiệp"*.
2. **02. GIỚI THIỆU CÔ DÂU & CHÚ RỂ (Hero):** Tên cô dâu chú rể, ảnh bìa, ngày cưới, lời mời mở đầu.
3. **03. ĐẠI DIỆN HAI GIA ĐÌNH (CÙNG MỘT HÀNG):**
   - **Nhà Trai** và **Nhà Gái** luôn nằm cạnh nhau trên cùng một hàng (kể cả trên điện thoại).
   - Mỗi bên hiển thị đại diện gia đình, địa chỉ tư gia và nút bản đồ chỉ đường riêng.
4. **04. LỄ THÀNH HÔN:** Thời gian, địa điểm, địa chỉ và nút bản đồ chỉ đường riêng.
5. **05. BỮA CƠM THÂN MẬT:** Thời gian, địa điểm, địa chỉ và nút bản đồ chỉ đường riêng.
6. **06. ALBUM ẢNH CƯỚI (Gallery):**
   - **Luôn đúng 2 ảnh mỗi hàng trên mọi thiết bị** (kể cả mobile).
   - Chạm vào ảnh mở Lightbox phóng to xem nét, hỗ trợ vuốt chạm trên điện thoại & phím mũi tên.
7. **07. ĐẾM NGƯỢC NGÀY CƯỚI (Countdown):** Cập nhật từng giây, số lật mượt mà.
8. **08. LỜI CHÚC KHÁCH MỜI (Wishes):**
   - Form lời chúc tích hợp **Supabase Realtime** (gửi là hiển thị ngay).
   - **Hai nút nằm cạnh nhau trên cùng một hàng:** **“Gửi lời chúc”** và **“Gửi quà mừng”**.
9. **09. GỬI QUÀ MỪNG (Gift QR Modal):**
   - Khi bấm nút “Gửi quà mừng”, popup mở ra hiển thị 2 mã QR riêng: **Nhà Gái** và **Nhà Trai**.
   - Hỗ trợ đóng bằng phím Escape, bấm nút ✕ hoặc bấm ra ngoài màn hình mờ.

---

## 🎵 Nhạc Nền

- Sử dụng file nhạc có sẵn tại: `client/src/assets/audio/wedding-song.mp3`.
- Có nút bật/tắt nhạc cố định ở góc dưới màn hình (phím tắt `M`).
- Tự động phát nhẹ nhàng sau khi khách nhấn mở phong bì thiệp mời.

---

## ⚙️ Cấu Hình Nhanh Tại `client/src/config/wedding.js`

Toàn bộ thông tin hiển thị trên thiệp được tập trung tại một file duy nhất:
[`client/src/config/wedding.js`](client/src/config/wedding.js):
- Tên cô dâu, chú rể, ngày giờ cưới.
- Đại diện, địa chỉ & link Google Maps của Nhà Trai, Nhà Gái.
- Thời gian, địa điểm Lễ Thành Hôn và Bữa Cơm Thân Mật.
- Danh sách ảnh cưới trong album.
- Tài khoản ngân hàng & ảnh QR mừng cưới Nhà Gái, Nhà Trai.
- Cấu hình kết nối **Supabase** (đã điền sẵn URL & Publishable Key của bạn).

---

## 🚀 Chạy Thử Dự Án (Local)

Mở giao diện bằng Live Server trong VS Code:
1. Nhấp chuột phải vào file [`client/index.html`](client/index.html).
2. Chọn **"Open with Live Server"**.

Hoặc chạy bằng lệnh:
```bash
npx serve client -p 5500
```

---

## 🧪 Chạy Kiểm Thử (Unit Tests)

```bash
npm test
```
*(Kiểm tra toàn bộ 8 bài test về tính toán countdown, validation tên/lời chúc và độ dài an toàn)*
