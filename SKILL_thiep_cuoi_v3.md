# SKILL.md — Website thiệp cưới online

## Vai trò
Bạn là chuyên gia UI/UX và full-stack developer. Hãy tạo website thiệp cưới online tinh tế, lãng mạn, ưu tiên điện thoại, có nhạc nền, hiệu ứng chuyển cảnh đẹp và lời chúc khách mời.

## Trình tự bắt buộc
1. Phong bì thiệp mời ở màn hình đầu.
2. Khách chạm “Nhấp để mở”; phong bì mở bằng animation, thiệp trượt ra.
3. Giới thiệu cô dâu, chú rể.
4. Đại diện nhà trai và nhà gái cùng một hàng, mỗi bên có địa chỉ và bản đồ riêng.
5. Thông tin lễ thành hôn: ngày giờ, địa điểm, địa chỉ, bản đồ.
6. Thông tin bữa cơm thân mật: ngày giờ, địa điểm, địa chỉ, bản đồ.
7. Album ảnh cưới.
8. Đồng hồ đếm ngược ngày cưới.
9. Lời chúc của khách mời.
10. Gửi quà mừng bằng QR cô dâu/chú rể.

## Phong cách giao diện
- Tone sáng, sang trọng: trắng ngà, hồng phấn, be champagne, điểm nhấn nâu hồng hoặc xanh sage nhạt.
- Tiêu đề dùng Cormorant Garamond hoặc Playfair Display; nội dung dùng Be Vietnam Pro hoặc Montserrat; font script chỉ dùng cho tên/điểm nhấn.
- Có fallback font; không phụ thuộc vào một font web duy nhất.
- Nhiều khoảng trắng, đường viền mảnh, chi tiết hoa lá/giấy tinh tế; tránh màu neon, nền tối và hiệu ứng quá dày.
- Responsive, ưu tiên mobile-first.
- **Album ảnh phải luôn có đúng 2 ảnh mỗi hàng, kể cả trên điện thoại.** Dùng CSS Grid 2 cột cố định, ảnh không méo (`object-fit: cover`).
- Nhà trai và nhà gái cũng luôn nằm cạnh nhau trên cùng một hàng; nội dung dài được xuống dòng bên trong cột.

## Hiệu ứng chuyển cảnh
- Phong bì: nắp mở 3D nhẹ, con dấu mờ dần, thiệp trượt lên.
- Các phần: reveal khi cuộn, fade-in, translate nhẹ, đường nét hoa lá xuất hiện tinh tế.
- Album: ảnh xuất hiện lần lượt; chạm ảnh mở lightbox.
- Countdown: số thay đổi mượt, không nhấp nháy.
- Dùng CSS transform/opacity và IntersectionObserver; tránh hiệu ứng gây chóng mặt hoặc làm chậm trang.
- Tôn trọng `prefers-reduced-motion`; nội dung vẫn phải đọc được nếu animation/JS lỗi.

## Nhạc nền
- Dùng file nhạc có quyền sử dụng, ví dụ `assets/audio/wedding-song.mp3`.
- Có nút phát/tạm dừng dễ thấy.
- Không tự phát nhạc trước tương tác của khách; nếu phát lỗi thì thiệp vẫn hoạt động bình thường.

## Lời chúc
- Form gồm tên khách và lời chúc; validate trường bắt buộc, giới hạn độ dài.
- Có trạng thái đang gửi, thành công, thất bại và danh sách trống.
- Render nội dung dưới dạng text, không đưa trực tiếp nội dung người dùng vào `innerHTML`.
- Muốn tất cả khách xem được lời chúc của nhau thì phải dùng backend/API và cơ sở dữ liệu hoặc dịch vụ lưu trữ tập trung.
- `localStorage` chỉ phù hợp demo cục bộ; không giả vờ rằng dữ liệu đã được công khai.
- Cân nhắc chống spam, giới hạn tần suất và kiểm duyệt bình luận.

## Nút “Gửi quà mừng” và khu vực QR
- Ở section Lời chúc, đặt hai nút cạnh nhau trên cùng một hàng: **“Gửi lời chúc”** và **“Gửi quà mừng”**. Trên màn hình nhỏ vẫn cố gắng giữ cùng hàng; nếu quá hẹp, cho phép hai nút co giãn cân đối mà không tràn ngang.
- Nút “Gửi lời chúc” dùng để gửi nội dung form lời chúc như bình thường.
- Nút “Gửi quà mừng” không gửi form lời chúc. Khi được bấm, mở một modal/popup hoặc panel overlay đẹp, có animation nhẹ.
- Trong popup, hiển thị hai khu vực riêng:
  1. **Nhà gái** — ảnh QR nhà gái và tên chủ tài khoản/đại diện nhà gái.
  2. **Nhà trai** — ảnh QR nhà trai và tên chủ tài khoản/đại diện nhà trai.
- Có tiêu đề rõ “Gửi quà mừng”, lời cảm ơn, nút đóng và hỗ trợ đóng bằng phím Escape; không đóng popup khi khách vô tình bấm nội dung QR.
- Trên điện thoại, hai QR xếp theo chiều dọc nếu cần để ảnh đủ lớn; trên màn hình rộng có thể đặt hai QR cạnh nhau. Đây là ngoại lệ bố cục dành riêng cho popup QR, không ảnh hưởng quy tắc album ảnh 2 cột.
- QR phải rõ nét, có thể bấm để xem lớn. Tên người nhận/ngân hàng chỉ dùng thông tin chủ thiệp cung cấp; không tự tạo dữ liệu tài khoản.
- Không mở popup tự động; chỉ mở khi khách chủ động bấm nút “Gửi quà mừng”.

## Công nghệ và bảo mật
- Frontend: HTML/CSS/JavaScript hoặc React + Vite.
- Nếu lưu lời chúc tập trung: Node.js + Express, MySQL.
- Tên, ngày giờ, địa chỉ, link bản đồ, ảnh, nhạc và QR nằm trong file cấu hình riêng.
- Validate ở cả client và server; dùng truy vấn tham số hóa; giới hạn độ dài và tốc độ gửi.
- Không để mật khẩu/token trong frontend hoặc Git.
- Tối ưu ảnh WebP/AVIF, lazy-load ảnh bên dưới màn hình đầu.
- Kiểm thử iOS Safari, Android Chrome, desktop, bàn phím và reduced motion.

## Quy trình
1. Dựng theme sáng và font.
2. Làm phong bì và animation mở.
3. Tạo các section đúng thứ tự.
4. Kiểm tra 2 cột gia đình và 2 cột album trên mobile.
5. Thêm nhạc, countdown, bản đồ và QR.
6. Thêm form lời chúc; tích hợp backend nếu cần đồng bộ.
7. Kiểm thử validate, lỗi mạng, hiệu năng và responsive.
8. Viết README hướng dẫn thay nội dung và triển khai.

## Tiêu chí nghiệm thu
- Phong bì xuất hiện đầu tiên và mở bằng một lần chạm.
- Tone sáng, font đẹp, hiệu ứng mượt và tinh tế.
- Nhà trai/nhà gái cùng hàng; mỗi nhà có map riêng.
- Lễ thành hôn và bữa cơm thân mật có thông tin/map riêng.
- Album luôn 2 ảnh mỗi hàng.
- Countdown chính xác theo cấu hình và múi giờ.
- Nhạc bật/tắt được, không autoplay trước tương tác.
- QR rõ; lời chúc validate và lưu đúng cách.
