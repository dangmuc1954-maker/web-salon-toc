# 💇‍♀️ WEBSITE SALON TÓC - XEM MẪU TÓC, BẢNG GIÁ, BẢNG MÀU & ĐẶT LỊCH STYLIST

Dự án được thiết kế giúp khách hàng vào xem toàn bộ **Mẫu tóc**, **Bảng giá dịch vụ**, **Bảng màu nhuộm**, **Tìm kiếm theo tên**, **Order nhân viên tư vấn** và **Đặt lịch đúng nhân viên** kèm gửi thông báo về máy chủ / Telegram / Zalo.

---

## 🚀 CÁCH CHẠY TRÊN MÁY TÍNH (1-CLICK)

1. Mở thư mục: `D:\dự án antigravity\web-salon-toc`
2. Nhấp đúp vào file **`START_SALON.bat`**
3. Trình duyệt tự động mở tại:
   - **Trang khách hàng:** `http://localhost:3005`
   - **Trang xem đơn trên máy chủ:** `http://localhost:3005/orders`

---

## ✏️ CÁCH SỬA TRỰC TIẾP MẪU TÓC, BẢNG GIÁ, BẢNG MÀU & SĐT NHÂN VIÊN

Toàn bộ dữ liệu của Website nằm gọn trong **1 file duy nhất**:
👉 **`data/salon-config.js`**

Đặc biệt: **Anh chỉ cần mở file `data/salon-config.js`, sửa xong bấm Lưu (`Ctrl + S`), sau đó tải lại trang web (`F5`) là web tự cập nhật ngay lập tức** (không cần tắt đi bật lại server).

### 1. Thêm ảnh của Salon
- **Cách 1 (Khuyên dùng):** Copy file ảnh chụp mẫu tóc/nhân viên của Salon vào thư mục `public/images/` (ví dụ: `public/images/toc-layer-1.jpg`), sau đó trong `data/salon-config.js` điền đường dẫn:
  ```js
  image: "/images/toc-layer-1.jpg"
  ```
- **Cách 2:** Dán trực tiếp link ảnh từ Facebook / Imgur / Google Drive công khai.

### 2. Thêm / Sửa Nhân Viên & Số Điện Thoại Liên Lạc (`staff`)
Trong mục `staff` của `data/salon-config.js`:
```js
{
  id: "stylist-minh-khang",
  name: "Master Minh Khang",
  role: "Giám Đốc Sáng Tạo / Master Stylist",
  level: "Master Stylist",
  experience: "10 năm kinh nghiệm",
  phone: "0901234567", // SĐT hiện cho khách gọi & gửi về máy chủ khi khách order
  zalo: "0901234567",  // Số Zalo để khách bấm nhắn tin trực tiếp
  avatar: "/images/stylist-khang.jpg",
  shift: "09:00 - 20:00 (T2 - CN)",
  specialties: ["Cắt Layer Nữ", "Uốn Sóng Lơi Hàn Quốc"],
  bio: "Mô tả ngắn giới thiệu kinh nghiệm của nhân viên..."
}
```

### 3. Thêm Ảnh Mẫu Tóc & Mô Tả Chi Tiết (`hairstyles`)
Trong mục `hairstyles` của `data/salon-config.js`:
```js
{
  id: "hair-layer-moi",
  name: "Tên Kiểu Tóc",
  category: "Tóc Nữ Uốn",
  priceRange: "650.000đ - 1.200.000đ",
  duration: "120 phút",
  badge: "Mẫu Mới",
  image: "/images/mau-toc-1.jpg",
  gallery: ["/images/mau-toc-1.jpg", "/images/mau-toc-1-goc-nghieng.jpg"],
  faceShapes: ["Mặt tròn", "Mặt trái xoan"],
  hairLength: "Ngang lưng",
  recommendedColors: ["Nâu Tây", "Nâu Trà Sữa"],
  recommendedStylistId: "stylist-minh-khang",
  shortDesc: "Mô tả ngắn hiển thị ngoài thẻ...",
  detailDesc: "Mô tả chi tiết kỹ thuật cắt, uốn, chất tóc phù hợp khi khách bấm vào ảnh..."
}
```

### 4. Thêm Dịch Vụ & Bảng Giá (`services`)
Trong mục `services` của `data/salon-config.js`:
- Điền `name`, `category`, `priceDisplay`, `shortDesc`, `detailDesc` và các gói giá chi tiết trong mảng `tiers`.

### 5. Cài Đặt Nhận Thông Báo Đơn Đặt Lịch Qua Telegram / Zalo (`notifications`)
Trong mục `notifications` của `data/salon-config.js` (hoặc cài biến môi trường trên Render):
- `telegramBotToken`: Điền Token lấy từ `@BotFather`
- `telegramChatId`: Điền ID nhóm Telegram của Salon hoặc ID cá nhân của anh
- `zaloWebhookUrl`: Điền link Webhook nếu anh nối qua Zalo OA / Make.com / n8n.
