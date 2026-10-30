# CẤU_TRÚC.md — Cấu trúc website thiệp cưới online

## 1. Trình tự thiệp

```text
01. PHONG BÌ THIỆP MỜI
    └── Chạm “Nhấp để mở” → nắp phong bì mở, thiệp trượt ra
02. GIỚI THIỆU CÔ DÂU & CHÚ RỂ
03. ĐẠI DIỆN HAI GIA ĐÌNH — CÙNG MỘT HÀNG
    ├── Trái: NHÀ TRAI, đại diện, địa chỉ, bản đồ nhà trai
    └── Phải: NHÀ GÁI, đại diện, địa chỉ, bản đồ nhà gái
04. LỄ THÀNH HÔN — ngày giờ, địa điểm, địa chỉ, bản đồ
05. BỮA CƠM THÂN MẬT — ngày giờ, địa điểm, địa chỉ, bản đồ
06. ALBUM ẢNH CƯỚI — 2 ảnh mỗi hàng trên mọi kích thước
07. ĐẾM NGƯỢC NGÀY CƯỚI
08. LỜI CHÚC — form và danh sách lời chúc
09. GỬI QUÀ MỪNG — QR cô dâu/chú rể và lời cảm ơn
```

## 2. Cây thư mục

```text
wedding-invitation/
├── README.md
├── .env.example
├── .gitignore
├── package.json
├── client/
│   ├── index.html
│   ├── public/
│   │   ├── favicon.ico
│   │   └── og-cover.webp
│   └── src/
│       ├── main.js
│       ├── config/
│       │   └── wedding.js
│       ├── styles/
│       │   ├── reset.css
│       │   ├── variables.css
│       │   ├── base.css
│       │   ├── layout.css
│       │   ├── animations.css
│       │   └── responsive.css
│       ├── components/
│       │   ├── envelope.js
│       │   ├── music-player.js
│       │   ├── couple-intro.js
│       │   ├── family-representatives.js
│       │   ├── event-card.js
│       │   ├── wedding-gallery.js
│       │   ├── countdown.js
│       │   ├── wishes.js
│       │   └── gift-qr.js
│       ├── services/
│       │   ├── api.js
│       │   └── validation.js
│       └── assets/
│           ├── images/
│           │   ├── couple-cover.webp
│           │   ├── family/
│           │   ├── gallery/
│           │   └── qr/
│           │       ├── nha-gai-qr.png
│           │       └── nha-trai-qr.png
│           ├── audio/
│           │   └── wedding-song.mp3
│           └── fonts/
├── server/                       # Chỉ cần nếu lưu lời chúc tập trung
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/database.js
│       ├── routes/wishes.routes.js
│       ├── controllers/wishes.controller.js
│       ├── services/wishes.service.js
│       ├── repositories/wishes.repository.js
│       └── middleware/
│           ├── validate-request.js
│           ├── rate-limit.js
│           └── error-handler.js
├── database/
│   └── schema.sql
└── tests/
    ├── wishes.test.js
    └── countdown.test.js
```

## 3. Thiết kế
- Tone sáng: nền `#FFFDFB`, hồng phấn `#F5E8E9`, champagne `#D6B98C`, chữ nâu xám `#5C5050`.
- Font tiêu đề: Cormorant Garamond hoặc Playfair Display.
- Font nội dung: Be Vietnam Pro hoặc Montserrat.
- Phong bì có nắp mở 3D nhẹ; section fade/reveal; ảnh có lightbox; chuyển động phải tôn trọng `prefers-reduced-motion`.

### CSS bắt buộc cho album 2 cột
```css
.wedding-gallery__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.wedding-gallery__item {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}
```
Không đổi album thành một cột trên màn hình nhỏ.

## 4. Hành vi nút “Gửi quà mừng”

Trong section lời chúc, hai nút đặt cạnh nhau:
- **Gửi lời chúc**: validate và gửi form lời chúc.
- **Gửi quà mừng**: mở popup/modal QR, không gửi form.

Popup hiển thị hai mục có nhãn rõ ràng:
- **NHÀ GÁI**: ảnh QR nhà gái, tên người nhận và ngân hàng (nếu được cung cấp).
- **NHÀ TRAI**: ảnh QR nhà trai, tên người nhận và ngân hàng (nếu được cung cấp).

Yêu cầu tương tác:
- Có nút đóng, đóng bằng phím Escape và có nhãn truy cập được.
- Mở bằng thao tác người dùng; không tự bật khi tải trang.
- Trên desktop có thể đặt hai QR cạnh nhau; trên điện thoại xếp dọc nếu cần để QR đủ rõ.
- Khi popup mở, giữ focus hợp lý; khi đóng, trả focus về nút “Gửi quà mừng”.
- Ảnh QR phải lấy từ cấu hình, không tự tạo thông tin tài khoản.

## 5. File cấu hình `client/src/config/wedding.js`

```js
export const wedding = {
  brideName: "Tên cô dâu",
  groomName: "Tên chú rể",
  weddingDate: "2027-05-23T09:00:00+07:00",

  groomFamily: {
    title: "NHÀ TRAI",
    representatives: ["Ông ...", "Bà ..."],
    address: "Địa chỉ nhà trai",
    mapUrl: "https://maps.google.com/?q=..."
  },

  brideFamily: {
    title: "NHÀ GÁI",
    representatives: ["Ông ...", "Bà ..."],
    address: "Địa chỉ nhà gái",
    mapUrl: "https://maps.google.com/?q=..."
  },

  ceremony: {
    title: "LỄ THÀNH HÔN",
    dateTime: "2027-05-23T09:00:00+07:00",
    venue: "Tên địa điểm",
    address: "Địa chỉ lễ thành hôn",
    mapUrl: "https://maps.google.com/?q=..."
  },

  familyMeal: {
    title: "BỮA CƠM THÂN MẬT",
    dateTime: "2027-05-23T10:30:00+07:00",
    venue: "Tên địa điểm",
    address: "Địa chỉ bữa cơm thân mật",
    mapUrl: "https://maps.google.com/?q=..."
  },

  gallery: [
    "/src/assets/images/gallery/photo-01.webp",
    "/src/assets/images/gallery/photo-02.webp"
  ],

  musicUrl: "/src/assets/audio/wedding-song.mp3",

  gifts: {
    brideFamily: {
      title: "NHÀ GÁI",
      recipientName: "Tên người nhận / đại diện nhà gái",
      bankName: "Tên ngân hàng",
      qrImage: "/src/assets/images/qr/nha-gai-qr.png"
    },
    groomFamily: {
      title: "NHÀ TRAI",
      recipientName: "Tên người nhận / đại diện nhà trai",
      bankName: "Tên ngân hàng",
      qrImage: "/src/assets/images/qr/nha-trai-qr.png"
    }
  }
};
```
Tất cả thông tin trong ví dụ là dữ liệu mẫu, phải thay bằng thông tin thật do chủ thiệp cung cấp.

## 5. Lưu lời chúc tập trung (tùy chọn)

```sql
CREATE TABLE wishes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  guest_name VARCHAR(100) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE
);
```

API đề xuất:
- `GET /api/wishes` — lấy lời chúc được phép hiển thị.
- `POST /api/wishes` — gửi lời chúc.
- `DELETE /api/wishes/:id` — chỉ quản trị viên đã xác thực.

Phải validate cả client/server, giới hạn độ dài và tần suất gửi, dùng truy vấn tham số hóa và render lời chúc dưới dạng text. `localStorage` chỉ lưu cục bộ, không đồng bộ giữa khách mời.

## 6. Checklist
- [ ] Phong bì là màn hình đầu tiên; bấm một lần mở được thiệp.
- [ ] Nhạc có nút bật/tắt, không tự phát trước tương tác.
- [ ] Nhà trai và nhà gái nằm cùng một hàng; map riêng.
- [ ] Lễ thành hôn và bữa cơm thân mật có địa chỉ/map riêng.
- [ ] Album luôn 2 ảnh mỗi hàng, kể cả mobile.
- [ ] Countdown đúng ngày giờ/múi giờ.
- [ ] Form lời chúc có validate và báo trạng thái rõ ràng.
- [ ] Nút “Gửi quà mừng” nằm cạnh “Gửi lời chúc”.
- [ ] Bấm “Gửi quà mừng” mở popup chứa QR + tên nhà gái và QR + tên nhà trai.
- [ ] Popup đóng được bằng nút đóng và phím Escape; không tự bật.
- [ ] QR rõ nét; không dùng dữ liệu tài khoản giả khi phát hành.
- [ ] Responsive, hiệu ứng nhẹ, không có lỗi nghiêm trọng trên điện thoại.
