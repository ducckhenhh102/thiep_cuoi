/**
 * wedding.js — Cấu hình trung tâm thiệp cưới online (Chuẩn v3)
 *
 * Chỉnh sửa file này để thay đổi toàn bộ thông tin hiển thị trên thiệp:
 * Tên, gia đình, ngày giờ, địa điểm 2 buổi tiệc, album, nhạc, tài khoản QR, Supabase.
 */

export const wedding = {
  // ── 1. Tên cô dâu & chú rể ──────────────────────────────────────────
  brideName: 'Lan',
  groomName: 'Minh',
  brideFullName: 'Nguyễn Thị Lan',
  groomFullName: 'Trần Văn Minh',

  // ── 2. Ngày giờ cưới (dùng cho countdown và hiển thị) ───────────────
  // Định dạng ISO: YYYY-MM-DDTHH:mm:ss+07:00
  weddingDate: '2027-01-15T09:00:00+07:00',
  dateDisplay: 'Thứ Sáu, ngày 15 tháng 01 năm 2027',

  // ── 3. Đại diện hai gia đình (Hiển thị cùng một hàng) ──────────────
  groomFamily: {
    title: 'NHÀ TRAI',
    representatives: ['Ông Trần Văn A', 'Bà Lê Thị B'],
    address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    mapUrl: 'https://maps.google.com/?q=10.7769,106.7009',
  },

  brideFamily: {
    title: 'NHÀ GÁI',
    representatives: ['Ông Nguyễn Văn C', 'Bà Hoàng Thị D'],
    address: '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    mapUrl: 'https://maps.google.com/?q=10.7735,106.7032',
  },

  // ── 4. Thông tin Lễ thành hôn ───────────────────────────────────────
  ceremony: {
    title: 'LỄ THÀNH HÔN',
    dateTime: '2027-01-15T09:00:00+07:00',
    timeDisplay: '09:00 sáng — 15/01/2027',
    venue: 'Trung Tâm Tiệc Cưới Hoàng Gia',
    address: 'Sảnh Diamond, 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    mapUrl: 'https://maps.google.com/?q=10.7769,106.7009',
  },

  // ── 5. Thông tin Bữa cơm thân mật ──────────────────────────────────
  familyMeal: {
    title: 'BỮA CƠM THÂN MẬT',
    dateTime: '2027-01-15T11:30:00+07:00',
    timeDisplay: '11:30 trưa — 15/01/2027',
    venue: 'Nhà hàng Receptions',
    address: 'Tầng 2, 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    mapUrl: 'https://maps.google.com/?q=10.7769,106.7009',
  },

  // ── 6. Lời mời & Câu chuyện tình yêu ───────────────────────────────
  invitationStory: `Chúng tôi gặp nhau vào một buổi chiều thu khi những chiếc lá vàng còn đang rơi nhẹ trên con đường quen thuộc. Từ một ánh nhìn tình cờ, chúng tôi đã tìm thấy nhau — người bạn đồng hành của cả cuộc đời.\n\nSau những năm tháng cùng nhau gắn bó, chúng tôi trân trọng mời bạn — người thân yêu, người bạn quý giá — đến chung vui trong ngày hạnh phúc nhất của chúng tôi.`,

  // ── 7. Ảnh bìa & Album ảnh cưới (Luôn 2 ảnh / hàng) ────────────────
  coverImage: 'src/assets/images/couple-cover.jpg',
  gallery: [
    { src: 'src/assets/images/gallery/photo-01.jpg', alt: 'Khoảnh khắc hạnh phúc', category: 'couple', baseLikes: 24 },
    { src: 'src/assets/images/gallery/photo-02.jpg', alt: 'Cùng nhau sánh bước', category: 'wedding', baseLikes: 38 },
    { src: 'src/assets/images/gallery/photo-03.jpg', alt: 'Nụ cười ngày chung đôi', category: 'wedding', baseLikes: 42 },
    { src: 'src/assets/images/gallery/photo-04.jpg', alt: 'Lời hẹn ước trọn đời', category: 'couple', baseLikes: 29 },
    { src: 'src/assets/images/gallery/photo-05.jpg', alt: 'Bình yên bên nhau', category: 'couple', baseLikes: 35 },
    { src: 'src/assets/images/gallery/photo-06.jpg', alt: 'Khởi đầu mới ngọt ngào', category: 'wedding', baseLikes: 51 },
    { src: 'src/assets/images/gallery/photo-07.jpg', alt: 'Ánh mắt trao yêu thương', category: 'couple', baseLikes: 33 },
    { src: 'src/assets/images/gallery/photo-08.jpg', alt: 'Tình yêu đơm hoa kết trái', category: 'wedding', baseLikes: 47 },
    { src: 'src/assets/images/gallery/photo-09.jpg', alt: 'Nhẫn cưới vĩnh cửu', category: 'wedding', baseLikes: 60 },
    { src: 'src/assets/images/gallery/photo-10.jpg', alt: 'Nắm tay đi hết cuộc đời', category: 'couple', baseLikes: 55 },
  ],

  // ── 8. Nhạc nền ────────────────────────────────────────────────────
  musicUrl: 'src/assets/audio/wedding-song.mp3',

  // ── 9. Gửi quà mừng (QR Nhà Gái & Nhà Trai) ────────────────────────
  gifts: {
    brideFamily: {
      title: 'NHÀ GÁI',
      recipientName: 'Nguyễn Thị Lan',
      bankName: 'Ngân hàng TMCP Ngoại thương VN (Vietcombank)',
      accountNumber: '1012345678',
      qrImage: 'src/assets/images/qr/nha-gai-qr.svg',
    },
    groomFamily: {
      title: 'NHÀ TRAI',
      recipientName: 'Trần Văn Minh',
      bankName: 'Ngân hàng TMCP Quân đội (MB Bank)',
      accountNumber: '9999888877',
      qrImage: 'src/assets/images/qr/nha-trai-qr.svg',
    },
  },

  // ── 10. Supabase Realtime Database ─────────────────────────────────
  supabase: {
    url:     'https://bqmqgxfxqxnrqasfrcjj.supabase.co',
    anonKey: 'sb_publishable_-cuN1qkJKBIK0-r4_w3jxw_5NxUsa9Z',
  },

  // ── 11. Mã PIN Quản trị viên (xóa lời chúc / bình luận) ──────────────
  adminPin: '123456',

  // ── 12. Metadata SEO & Open Graph ──────────────────────────────────
  meta: {
    title: 'Thiệp Cưới — Minh & Lan',
    description: 'Trân trọng kính mời bạn đến chung vui trong ngày cưới của Minh & Lan vào ngày 15/01/2027.',
    siteUrl: 'https://thiepcuoi.example.com',
    ogImage: 'src/assets/images/couple-cover.jpg',
  },

  // ── 13. Liên hệ dịch vụ thiệp cưới online ───────────────────────────
  contact: {
    phone: '0857272840',
    email: 'contactduckhenh@gmail.com',
  },
};

export default wedding;
