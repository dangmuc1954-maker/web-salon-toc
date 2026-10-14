/**
 * ============================================================================
 * FILE CẤU HÌNH DỮ LIỆU TRUNG TÂM - WEBSITE SALON TÓC
 * ============================================================================
 */

module.exports = {
  // ==========================================================================
  // 1. THÔNG TIN GIAO DIỆN, LOGO, GIỚI THIỆU, ĐỊA CHỈ & HOTLINE CỦA SALON
  // ==========================================================================
  salonInfo: {
    pageTitle: "LUXE HAIR STUDIO - Xem Mẫu Tóc, Bảng Giá, Bảng Màu & Đặt Lịch Stylist",
    name: "LUXE HAIR STUDIO & ACADEMY",
    shortName: "LUXE HAIR STUDIO",
    brandSubtitle: "Hair Salon & Color Lab",
    logoIconText: "✂",
    logoImageUrl: "", // Nếu tải ảnh Logo lên, web sẽ hiện ảnh Logo này thay cho ký hiệu kéo ✂ và làm icon tab web (Favicon)
    slogan: "Định Hình Phong Cách - Nâng Tầm Vẻ Đẹp Tóc Việt",
    heroTag: "✨ HỆ THỐNG ĐẶT LỊCH & CHỌN ĐÚNG STYLIST YÊU THÍCH",
    heroTitlePrefix: "Khám Phá",
    heroTitleHighlight: "Tất Cả Kiểu Tóc",
    heroTitleSuffix: ", Bảng Màu & Đặt Lịch Đúng Stylist",
    description:
      "Xem trọn bộ mẫu tóc nam nữ mới nhất kèm mô tả chi tiết, bảng giá dịch vụ minh bạch, bảng màu nhuộm trực quan và đặt lịch hoặc order đúng nhân viên tư vấn chỉ trong 30 giây.",
    heroImage1: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    heroImage2: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    stat1Label: "Mẫu Tóc Thịnh Hành",
    stat2Label: "Gói Dịch Vụ Minh Bạch",
    stat3Label: "Mã Màu Nhuộm Chuẩn",
    stat4Label: "Master & Senior Stylist",
    address: "128 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
    hotline: "0909888999",
    zaloMain: "0909888999",
    openHours: "08:30 - 21:00 (Thứ 2 - Chủ Nhật)",
    footerNote: "Hệ thống Đặt lịch làm tóc & Tư vấn Stylist trực tuyến 24/7.",
    sectionHairTitle: "Xem Tất Cả Kiểu Tóc & Mô Tả Chi Tiết",
    sectionHairSub: "Bấm vào từng ảnh mẫu tóc để xem chi tiết kỹ thuật cắt/uốn/nhuộm, khuôn mặt phù hợp, thời gian làm và chọn nhân viên thực hiện.",
    sectionServiceTitle: "Tất Cả Dịch Vụ Làm Tóc & Chi Tiết Giá",
    sectionServiceSub: "Cam kết báo đúng giá theo gói dịch vụ, sử dụng thuốc chính hãng và bảo hành miễn phí rõ ràng cho từng dịch vụ.",
    sectionColorTitle: "Bảng Màu Sắc Tóc & Tư Vấn Tông Da",
    sectionColorSub: "Khám phá các mã màu nhuộm từ Nâu Công Sở không cần tẩy đến Balayage / Khói thời thượng. Bấm vào màu bất kỳ để xem chi tiết & chọn nhuộm.",
    sectionStaffTitle: "Chọn Nhân Viên Tư Vấn & Đặt Lịch Đúng Stylist",
    sectionStaffSub: "Mỗi Stylist có thế mạnh riêng và thông tin số điện thoại / Zalo trực tiếp. Quý khách có thể Order nhân viên tư vấn hoặc Đặt lịch đích danh nhân viên mình yêu thích.",
    sectionBookingTitle: "Gửi Yêu Cầu Về Salon & Nhận SĐT Nhân Viên Ngay",
    sectionBookingSub: "Sau khi bấm gửi, đơn của quý khách sẽ được chuyển ngay về máy chủ Salon & thông báo cho đúng nhân viên phụ trách, đồng thời hiển thị SĐT/Zalo của nhân viên đó để quý khách liên lạc trực tiếp.",
    timeSlots: [
      "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
      "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
    ]
  },

  // ==========================================================================
  // 2. CẤU HÌNH NHẬN THÔNG BÁO ĐƠN ĐẶT LỊCH / ORDER TƯ VẤN (TELEGRAM & ZALO)
  // ==========================================================================
  notifications: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
    zaloWebhookUrl: process.env.ZALO_WEBHOOK_URL || "",
    adminPasscode: process.env.ADMIN_PASSCODE || "123456"
  },

  // ==========================================================================
  // 3. DANH SÁCH NHÂN VIÊN / STYLIST (CÓ SĐT & ZALO ĐỂ KHÁCH LIÊN LẠC)
  // ==========================================================================
  staff: [
    {
      id: "stylist-minh-khang",
      name: "Master Minh Khang",
      role: "Giám Đốc Sáng Tạo / Master Stylist",
      level: "Master Stylist",
      experience: "10 năm kinh nghiệm",
      phone: "0901234567",
      zalo: "0901234567",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
      rating: 5.0,
      reviewsCount: 342,
      shift: "09:00 - 20:00 (T2 - CN)",
      specialties: ["Cắt Layer Nữ", "Thiết kế dáng tóc theo khuôn mặt", "Uốn Sóng Lơi Hàn Quốc"],
      bio: "Tốt nghiệp học viện tóc tại Seoul. Chuyên gia thiết kế form tóc che khuyết điểm khuôn mặt tròn, vuông và tạo phồng chân tóc tự nhiên dễ chăm sóc tại nhà.",
      surcharge: "Phụ thu Master: +100.000đ (Miễn phí khi đặt lịch trước qua Web)",
      status: "Đang nhận lịch"
    },
    {
      id: "stylist-hoang-nam",
      name: "Stylist Hoàng Nam",
      role: "Chuyên Gia Hóa Chất & Nhuộm Màu",
      level: "Color Director",
      experience: "8 năm kinh nghiệm",
      phone: "0902345678",
      zalo: "0902345678",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80",
      rating: 4.9,
      reviewsCount: 289,
      shift: "08:30 - 21:00 (T2 - CN)",
      specialties: ["Nhuộm Balayage / Highlight", "Nhuộm Khói Không Khô Xơ", "Cân Bằng Nền Tóc Khó"],
      bio: "Bậc thầy pha chế màu nhuộm thời trang, Balayage Âu Mỹ, Nâu Trà Sữa và Xám Khói giữ độ bóng mượt tối đa với công thức bọc Olaplex.",
      surcharge: "Không phụ thu",
      status: "Đang nhận lịch"
    },
    {
      id: "stylist-lan-anh",
      name: "Stylist Lan Anh",
      role: "Chuyên Gia Uốn & Phục Hồi Tóc Nữ",
      level: "Senior Stylist",
      experience: "7 năm kinh nghiệm",
      phone: "0903456789",
      zalo: "0903456789",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80",
      rating: 4.9,
      reviewsCount: 256,
      shift: "08:30 - 20:00 (T2 - CN)",
      specialties: ["Uốn Sóng Nước", "Uốn Cúp Phồng Layer", "Phục Hồi Keratin & Collagen"],
      bio: "Tỉ mỉ, nhẹ nhàng, cực kỳ mát tay với các dòng tóc yếu, tóc tẩy khô xơ cần phục hồi lấy lại sóng tóc mềm mại chuẩn Hàn.",
      surcharge: "Không phụ thu",
      status: "Đang nhận lịch"
    },
    {
      id: "stylist-tuan-kiet",
      name: "Stylist Tuấn Kiệt",
      role: "Trưởng Nhóm Tóc Nam & Barber",
      level: "Senior Barber & Stylist",
      experience: "6 năm kinh nghiệm",
      phone: "0904567890",
      zalo: "0904567890",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
      rating: 4.8,
      reviewsCount: 215,
      shift: "09:00 - 21:00 (T2 - CN)",
      specialties: ["Cắt Nam Layer / Mullet / Mohican", "Uốn Con Sâu / Uốn Phồng Nam", "Ép Side Nam"],
      bio: "Chuyên trị các form tóc nam Hàn Quốc, Undercut lịch lãm, uốn Ruffled/Con sâu và ép side gọn gàng không cần vuốt sáp cầu kỳ.",
      surcharge: "Không phụ thu",
      status: "Đang nhận lịch"
    },
    {
      id: "stylist-thao-vy",
      name: "Chuyên Viên Thảo Vy",
      role: "Trưởng Bộ Phận Tư Vấn Mẫu & Màu Tóc",
      level: "Chuyên Gia Tư Vấn",
      experience: "5 năm kinh nghiệm",
      phone: "0905678901",
      zalo: "0905678901",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80",
      rating: 5.0,
      reviewsCount: 410,
      shift: "08:30 - 21:00 (T2 - CN)",
      specialties: ["Tư vấn kiểu tóc hợp khuôn mặt", "Kiểm tra chất tóc & Báo giá chuẩn", "Tư vấn màu hợp tông da"],
      bio: "Luôn sẵn sàng lắng nghe và phân tích chất tóc, khuôn mặt, gu thời trang để tư vấn cho khách kiểu tóc & gói dịch vụ tiết kiệm, ưng ý nhất.",
      surcharge: "Tư vấn miễn phí 100%",
      status: "Trực tư vấn 24/7"
    },
    {
      id: "stylist-gia-bao",
      name: "Stylist Gia Bảo",
      role: "Chuyên Gia Tóc Ngắn & Bob/Pixie",
      level: "Senior Stylist",
      experience: "6 năm kinh nghiệm",
      phone: "0906789012",
      zalo: "0906789012",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=80",
      rating: 4.9,
      reviewsCount: 198,
      shift: "09:00 - 20:30 (T2 - CN)",
      specialties: ["Tóc Bob Ôm Gáy", "Tóc Ngắn Layer", "Duỗi Hơi Nước Tự Nhiên"],
      bio: "Chuyên gia cắt các dòng tóc ngắn cá tính, tóc Bob ôm phồng tự nhiên, duỗi hơi nước bóng mượt không bị đơ thẳng.",
      surcharge: "Không phụ thu",
      status: "Đang nhận lịch"
    }
  ],

  // ==========================================================================
  // 4. DANH SÁCH MẪU TÓC / KIỂU TÓC CHI TIẾT
  // ==========================================================================
  hairstyles: [
    {
      id: "hair-layer-song-loi",
      name: "Tóc Nữ Layer Uốn Sóng Lơi Hàn Quốc",
      category: "Tóc Nữ Uốn",
      gender: "Nữ",
      priceRange: "650.000đ - 1.200.000đ",
      duration: "120 - 150 phút",
      featured: true,
      badge: "Hot Trend 2026",
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mặt tròn", "Mặt trái xoan", "Mặt góc cạnh", "Mặt dài"],
      hairLength: "Ngang vai đến ngang lưng",
      recommendedColors: ["Nâu Tây Lạnh", "Nâu Trà Sữa", "Nâu Chocolate"],
      recommendedStylistId: "stylist-minh-khang",
      recommendedServiceId: "srv-uon-setting",
      shortDesc: "Tỉa layer đa tầng kết hợp sóng lơi bồng bềnh tự nhiên, ôm gọn hai bên má giúp gương mặt thon gọn tức thì.",
      detailDesc:
        "Mẫu tóc Layer Uốn Sóng Lơi Hàn Quốc là lựa chọn số 1 cho các nàng yêu thích vẻ đẹp tự nhiên, trẻ trung và sang trọng. Kỹ thuật cắt tỉa Layer tạo độ bay nhẹ nhàng từ phần mái bay (curtain bangs) xuống đuôi tóc, kết hợp uốn nóng kỹ thuật số nhiệt độ thấp giúp lọn sóng mềm mại như tự cuốn lô. Đặc biệt sau khi gội chỉ cần sấy khô tự nhiên không cần cuốn lô cầu kỳ."
    },
    {
      id: "hair-balayage-tra-sua",
      name: "Tóc Nhuộm Balayage Nâu Trà Sữa Ánh Khói",
      category: "Tóc Nữ Nhuộm",
      gender: "Nữ",
      priceRange: "1.100.000đ - 1.800.000đ",
      duration: "180 - 210 phút",
      featured: true,
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mọi khuôn mặt", "Đặc biệt tôn da trắng sáng"],
      hairLength: "Ngang lưng",
      recommendedColors: ["Nâu Trà Sữa Ánh Khói", "Xám Khói Balayage"],
      recommendedStylistId: "stylist-hoang-nam",
      recommendedServiceId: "srv-balayage",
      shortDesc: "Kỹ thuật chải màu Balayage chuyển tầng mượt mà từ chân tối sang đuôi sáng, mọc chân tóc mới vẫn cực đẹp.",
      detailDesc:
        "Kỹ thuật nhuộm Balayage Pháp kết hợp tông Nâu Trà Sữa Ánh Khói giúp mái tóc có chiều sâu 3D nổi bật dưới cả ánh đèn trong nhà lẫn nắng ngoài trời. Điểm cộng lớn nhất của Balayage là phần chân tóc được giữ tự nhiên, khi tóc mọc dài ra sau 3-5 tháng không bị lộ vệt chân đen tương phản. Quá trình nâng sáng tại Salon được pha kèm tinh chất Olaplex bảo vệ liên kết lõi tóc."
    },
    {
      id: "hair-bob-layer-cup",
      name: "Tóc Ngắn Bob Layer Cúp Phồng Chân Tóc",
      category: "Tóc Ngắn Nữ",
      gender: "Nữ",
      priceRange: "550.000đ - 950.000đ",
      duration: "90 - 120 phút",
      featured: true,
      badge: "Trẻ Ra 5 Tuổi",
      image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mặt tròn", "Mặt nhỏ", "Mặt trái tim"],
      hairLength: "Ngang cằm đến chạm vai",
      recommendedColors: ["Nâu Hạt Dẻ", "Đỏ Rượu Vang", "Xanh Đen Ánh Khói"],
      recommendedStylistId: "stylist-gia-bao",
      recommendedServiceId: "srv-uon-cup-bob",
      shortDesc: "Form tóc ngắn ôm gáy phồng tự nhiên, giải pháp hoàn hảo cho tóc mỏng thưa giúp mái tóc dày dặn gấp đôi.",
      detailDesc:
        "Thiết kế Bob Layer hiện đại với cấu trúc ôm sát phần gáy và tạo độ phồng tròn trịa ở vùng đỉnh đầu. Phần mái bay kết hợp hai lọn tóc mai ôm nhẹ xương quai hàm giúp gương mặt thanh thoát, năng động. Chỉ mất 3 phút sấy khô mỗi sáng là vào nếp chuẩn salon."
    },
    {
      id: "hair-song-nuoc-hippie",
      name: "Tóc Uốn Sóng Nước / Sóng Hippie Mềm Mại",
      category: "Tóc Nữ Uốn",
      gender: "Nữ",
      priceRange: "700.000đ - 1.250.000đ",
      duration: "130 - 160 phút",
      featured: false,
      badge: "Tóc Mỏng Nên Thử",
      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mặt gầy", "Mặt dài", "Mặt trái xoan"],
      hairLength: "Ngang vai trở lên",
      recommendedColors: ["Nâu Cam Đào", "Nâu Tây Lạnh", "Nâu Chocolate"],
      recommendedStylistId: "stylist-lan-anh",
      recommendedServiceId: "srv-uon-setting",
      shortDesc: "Những gợn sóng nước đều đặn từ ngang tai xuống đuôi tóc, mang đậm phong cách nàng thơ cổ điển Hàn Quốc.",
      detailDesc:
        "Uốn sóng nước (Water Wave) tạo hiệu ứng gợn sóng ngang mềm mại, không làm già mặt như kiểu xù mì truyền thống. Cực kỳ phù hợp cho những bạn nữ có mái tóc mỏng, xẹp, muốn tăng độ phồng gấp 2-3 lần và giữ sóng bền từ 6-9 tháng."
    },
    {
      id: "hair-duoi-hoi-nuoc-layer",
      name: "Tóc Duỗi Hơi Nước Bóng Gương Cắt Layer",
      category: "Tóc Nữ Duỗi",
      gender: "Nữ",
      priceRange: "600.000đ - 1.100.000đ",
      duration: "120 - 140 phút",
      featured: false,
      badge: "Bóng Mượt Chuẩn Salon",
      image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mọi khuôn mặt"],
      hairLength: "Ngang vai đến dài",
      recommendedColors: ["Xanh Đen Ánh Khói", "Đen Tự Nhiên Phủ Bóng", "Nâu Lạnh"],
      recommendedStylistId: "stylist-lan-anh",
      recommendedServiceId: "srv-duoi-hoi-nuoc",
      shortDesc: "Khắc phục hoàn toàn tóc bông xù, xoăn tự nhiên với công nghệ duỗi hơi nước giữ độ phồng tự nhiên, không bị đơ.",
      detailDesc:
        "Sử dụng máy kẹp hơi nước nano kết hợp tinh chất Keratin lấp đầy biểu bì tóc hư tổn. Mái tóc sau khi duỗi đạt độ bóng như gương, suôn mượt từ gốc tới ngọn nhưng đuôi tóc vẫn ôm nhẹ theo tầng Layer mà không hề bị thẳng đơ."
    },
    {
      id: "hair-nam-layer-comma",
      name: "Tóc Nam Layer Uốn Phồng & Mái Comma Hàn Quốc",
      category: "Tóc Nam",
      gender: "Nam",
      priceRange: "350.000đ - 650.000đ",
      duration: "60 - 90 phút",
      featured: true,
      badge: "Nam Được Yêu Thích Nhất",
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mặt dài", "Mặt góc cạnh", "Trán cao"],
      hairLength: "Tóc nam trung bình (6 - 10cm)",
      recommendedColors: ["Nâu Khói Nam", "Xanh Đen Ánh Khói", "Nâu Lạnh"],
      recommendedStylistId: "stylist-tuan-kiet",
      recommendedServiceId: "srv-combo-nam-vip",
      shortDesc: "Form cắt Layer nam kết hợp ép side gọn gàng và uốn phồng nhẹ giúp tóc vào nếp cả ngày không cần vuốt sáp nhiều.",
      detailDesc:
        "Kiểu tóc quốc dân dành cho nam giới văn phòng và học sinh, sinh viên. Phần hai bên mai (side) được ép ôm sát đầu không bị bung chỉa, phần đỉnh được uốn tạo texture bồng bềnh và tạo dáng mái Comma/7-3 hoặc Layer rủ che khuyết điểm trán cao cực tốt."
    },
    {
      id: "hair-nam-ruffled-perm",
      name: "Tóc Nam Uốn Ruffled / Con Sâu Texture",
      category: "Tóc Nam",
      gender: "Nam",
      priceRange: "450.000đ - 750.000đ",
      duration: "75 - 90 phút",
      featured: false,
      badge: "Cá Tính & Bụi Bặm",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mặt tròn", "Mặt trái xoan", "Mặt vuông"],
      hairLength: "Tóc nam 7 - 12cm",
      recommendedColors: ["Nâu Tây Lạnh", "Xám Khói", "Bạch Kim Ánh Bạc"],
      recommendedStylistId: "stylist-tuan-kiet",
      recommendedServiceId: "srv-combo-nam-vip",
      shortDesc: "Sóng Ruffled phóng khoáng, tạo độ phồng và kết cấu lọn tóc rối có chủ đích cực ngầu.",
      detailDesc:
        "Kỹ thuật uốn Ruffled Perm tạo ra những lọn sóng đan xen tự nhiên, mang lại vẻ ngoài trẻ trung, cá tính. Rất dễ chăm sóc: chỉ cần gội xong bóp nhẹ một chút tinh dầu hoặc sáp mềm là form tóc giữ nguyên cả ngày."
    },
    {
      id: "hair-butterfly-cut",
      name: "Tóc Butterfly Cut (Layer Cánh Bướm Đa Tầng)",
      category: "Tóc Nữ Cắt & Tạo Kiểu",
      gender: "Nữ",
      priceRange: "300.000đ - 950.000đ",
      duration: "60 - 120 phút",
      featured: true,
      badge: "Xu Hướng Âu - Á",
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=900&q=80"
      ],
      faceShapes: ["Mặt tròn", "Mặt vuông", "Mặt trái xoan"],
      hairLength: "Ngang lưng",
      recommendedColors: ["Nâu Chocolate", "Đỏ Rượu Vang", "Nâu Tây Lạnh"],
      recommendedStylistId: "stylist-minh-khang",
      recommendedServiceId: "srv-cat-thiet-ke",
      shortDesc: "Tầng tóc ngắn ôm mặt kết hợp tầng tóc dài bay bổng như cánh bướm, tạo độ dày và độ bay cực sang.",
      detailDesc:
        "Butterfly Cut là sự kết hợp tinh tế giữa tầng tóc ngắn ngang cằm (giúp tạo hiệu ứng như tóc ngắn khi buộc tóc lên) và tầng tóc dài phía dưới được tỉa ôm phồng. Phù hợp với những khách muốn giữ độ dài tóc nhưng vẫn muốn thay đổi diện mạo hoàn toàn mới mẻ."
    }
  ],

  // ==========================================================================
  // 5. DANH SÁCH DỊCH VỤ & BẢNG GIÁ CHI TIẾT
  // ==========================================================================
  services: [
    {
      id: "srv-cat-thiet-ke",
      name: "Cắt Thiết Kế Tạo Kiểu Nam / Nữ Chuẩn Khuôn Mặt",
      category: "Cắt & Tạo Kiểu",
      price: 250000,
      priceDisplay: "150.000đ - 350.000đ",
      originalPriceDisplay: "400.000đ",
      duration: "45 - 60 phút",
      warranty: "Bảo hành chỉnh form miễn phí 7 ngày",
      popular: true,
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80"
      ],
      shortDesc: "Trọn gói Gội đầu massage thư giãn + Tư vấn dáng mặt + Cắt thiết kế + Sấy tạo kiểu hoàn thiện.",
      detailDesc:
        "Quy trình 5 bước tiêu chuẩn: (1) Stylist kiểm tra chất tóc và cấu trúc xương hàm/trán, (2) Gội đầu sạch sâu kết hợp massage cổ vai gáy 15 phút, (3) Cắt thiết kế tạo phồng và tỉa Layer/Bob/Undercut chuẩn xác, (4) Xả dưỡng mềm mượt, (5) Sấy tạo kiểu và hướng dẫn khách cách tự sấy giữ form tại nhà.",
      tiers: [
        { name: "Cắt Nam Thiết Kế (Senior Stylist)", price: "150.000đ" },
        { name: "Cắt Nữ Thiết Kế (Senior Stylist)", price: "250.000đ" },
        { name: "Cắt Thiết Kế bởi Giám Đốc Sáng Tạo (Master)", price: "350.000đ" }
      ]
    },
    {
      id: "srv-uon-setting",
      name: "Uốn Nóng Kỹ Thuật Số / Uốn Sóng Lơi Hàn Quốc",
      category: "Uốn Tóc",
      price: 750000,
      priceDisplay: "650.000đ - 1.200.000đ",
      originalPriceDisplay: "1.500.000đ",
      duration: "120 - 150 phút",
      warranty: "Bảo hành sóng tóc 30 ngày",
      popular: true,
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
      ],
      shortDesc: "Uốn sóng lơi, sóng nước, uốn cúp tầng Layer bằng thuốc chính hãng Hàn/Nhật/Ý kèm bọc Keratin chống khô xơ.",
      detailDesc:
        "Sử dụng máy uốn kỹ thuật số kiểm soát nhiệt độ thông minh giúp lọn tóc căng bóng, đàn hồi tự nhiên mà không bị cháy hay khô ngọn. Đã bao gồm miễn phí cắt tạo form Layer trước khi uốn và hấp dưỡng khóa biểu bì sau khi hoàn tất.",
      tiers: [
        { name: "Gói Chuẩn Hàn (Obsidian / Amos)", price: "650.000đ" },
        { name: "Gói Cao Cấp Nhật Bản (Milbon / Shiseido)", price: "900.000đ" },
        { name: "Gói Luxury Ý + Bọc Olaplex (Goldwell / Davines)", price: "1.200.000đ" }
      ]
    },
    {
      id: "srv-uon-cup-bob",
      name: "Uốn Cúp Phồng Chân Tóc & Tóc Ngắn Bob",
      category: "Uốn Tóc",
      price: 600000,
      priceDisplay: "550.000đ - 950.000đ",
      originalPriceDisplay: "1.100.000đ",
      duration: "90 - 120 phút",
      warranty: "Bảo hành độ phồng 30 ngày",
      popular: false,
      image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
      shortDesc: "Kết hợp uốn phồng chân tóc Hàn Quốc và uốn cúp đuôi chữ C giúp mái tóc dày dặn, ôm gọn khuôn mặt.",
      detailDesc:
        "Giải pháp cứu cánh cho mái tóc mỏng xẹp sát da đầu. Kỹ thuật uốn phồng chân bằng trục đệm không để lại ngấn gãy, kết hợp uốn cúp đuôi giúp tóc ôm tự nhiên ngay sau khi sấy khô.",
      tiers: [
        { name: "Uốn phồng chân tóc riêng lẻ", price: "350.000đ" },
        { name: "Trọn gói Cắt + Uốn Cúp Bob Chuẩn Hàn", price: "600.000đ" },
        { name: "Trọn gói Cắt + Uốn Phồng Chân + Uốn Cúp Cao Cấp", price: "950.000đ" }
      ]
    },
    {
      id: "srv-nhuom-thoi-trang",
      name: "Nhuộm Màu Thời Trang Phủ Bóng Collagen",
      category: "Nhuộm Màu",
      price: 650000,
      priceDisplay: "550.000đ - 1.100.000đ",
      originalPriceDisplay: "1.300.000đ",
      duration: "90 - 120 phút",
      warranty: "Bảo hành đều màu 15 ngày",
      popular: true,
      image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80",
      shortDesc: "Nhuộm chuẩn tông bảng màu Nâu Tây, Trà Sữa, Nâu Lạnh, Đỏ Rượu, Xanh Đen với thuốc nhuộm giàu dưỡng chất.",
      detailDesc:
        "Thuốc nhuộm chính hãng hàm lượng amoniac thấp, không gây rát da đầu hay mùi hắc khó chịu. Pha trực tiếp tinh chất Collagen tươi vào bát thuốc nhuộm giúp hạt màu bám sâu và tạo lớp màng bóng mượt sau khi xả.",
      tiers: [
        { name: "Gói Nhuộm Chuẩn Hàn (Tóc ngắn/ngang vai)", price: "550.000đ" },
        { name: "Gói Nhuộm Cao Cấp Nhật Milbon / L'Oréal", price: "800.000đ" },
        { name: "Gói Nhuộm Hữu Cơ Organic + Khóa Màu", price: "1.100.000đ" }
      ]
    },
    {
      id: "srv-balayage",
      name: "Nhuộm Balayage / Highlight / Airtouch Nghệ Thuật",
      category: "Nhuộm Màu",
      price: 1350000,
      priceDisplay: "1.100.000đ - 1.800.000đ",
      originalPriceDisplay: "2.200.000đ",
      duration: "180 - 240 phút",
      warranty: "Tặng 1 lần gội khử vàng miễn phí trong 30 ngày",
      popular: true,
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      shortDesc: "Kỹ thuật gẩy light, chải màu Balayage hoặc thổi Airtouch chuyển màu mượt mà chuẩn salon quốc tế.",
      detailDesc:
        "Thực hiện trực tiếp bởi Color Director của Salon. Bao gồm nâng sáng kiểm soát nhiệt, pha Olaplex số 1 & số 2 bảo vệ cầu nối disulfua trong lõi tóc, nhuộm phủ màu khói/trà sữa/bạch kim và hấp khóa màu chuyên sâu.",
      tiers: [
        { name: "Gẩy Highlight / Babylight tạo điểm nhấn", price: "850.000đ" },
        { name: "Trọn gói Balayage + Nhuộm phủ màu khói/trà sữa", price: "1.350.000đ" },
        { name: "Trọn gói Airtouch Luxury + Phục hồi Olaplex", price: "1.800.000đ" }
      ]
    },
    {
      id: "srv-duoi-hoi-nuoc",
      name: "Duỗi Hơi Nước Nano Keratin Bóng Gương",
      category: "Duỗi / Ép",
      price: 700000,
      priceDisplay: "600.000đ - 1.100.000đ",
      originalPriceDisplay: "1.350.000đ",
      duration: "120 - 150 phút",
      warranty: "Bảo hành 30 ngày",
      popular: false,
      image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80",
      shortDesc: "Duỗi thẳng tự nhiên kết hợp cúp nhẹ phần đuôi bằng công nghệ hơi nước Nano không làm khô xẹp tóc.",
      detailDesc:
        "Đặc trị cho tóc bông xù tự nhiên, tóc xoăn rối khó vào nếp. Hơi nước siêu âm đưa dưỡng chất Keratin thẩm thấu vào từng sợi tóc trong lúc kẹp nhiệt, giúp tóc thẳng mượt tự nhiên mà vẫn giữ được độ bồng bềnh.",
      tiers: [
        { name: "Gói Duỗi Hơi Nước Tiêu Chuẩn", price: "600.000đ" },
        { name: "Gói Duỗi Hơi Nước + Cúp Đuôi Layer Nhật Bản", price: "850.000đ" },
        { name: "Gói Duỗi Keratin Phủ Bóng Cao Cấp", price: "1.100.000đ" }
      ]
    },
    {
      id: "srv-phuc-hoi-olaplex",
      name: "Phục Hồi Chuyên Sâu Keratin & Olaplex Tóc Cháy Nát",
      category: "Phục Hồi Tóc",
      price: 550000,
      priceDisplay: "450.000đ - 950.000đ",
      originalPriceDisplay: "1.200.000đ",
      duration: "60 - 90 phút",
      warranty: "Cam kết mềm mượt ngay từ lần đầu",
      popular: true,
      image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80",
      shortDesc: "Tái tạo cấu trúc lõi tóc hư tổn nặng do tẩy, uốn, nhuộm nhiều lần; giảm gãy rụng và chẻ ngọn tức thì.",
      detailDesc:
        "Sử dụng phác đồ phục hồi 4 bước chuẩn y khoa cho tóc: Làm sạch sâu chelating -> Đưa phân tử Olaplex No.1 & No.2 nối lại liên kết sừng bị đứt gãy -> Phủ Keratin thủy phân bằng máy phun sương Nano -> Khóa biểu bì bằng tinh dầu Argan nguyên chất.",
      tiers: [
        { name: "Hấp phục hồi Collagen tươi + Nano Mist", price: "450.000đ" },
        { name: "Phục hồi bọc Keratin chuyên sâu", price: "650.000đ" },
        { name: "Phác đồ Olaplex 4 bước đặc trị tóc tẩy nát", price: "950.000đ" }
      ]
    },
    {
      id: "srv-combo-nam-vip",
      name: "Combo Tóc Nam VIP (Cắt + Ép Side + Uốn/Nhuộm + Gội Massage)",
      category: "Combo Tiết Kiệm",
      price: 450000,
      priceDisplay: "350.000đ - 650.000đ",
      originalPriceDisplay: "800.000đ",
      duration: "75 - 90 phút",
      warranty: "Bảo hành nếp tóc 15 ngày",
      popular: true,
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
      shortDesc: "Trọn gói lột xác cho phái mạnh: Cắt thiết kế + Ép side ôm gọn + Uốn phồng/Con sâu hoặc Nhuộm màu + Gội thư giãn.",
      detailDesc:
        "Gói dịch vụ được hơn 80% khách hàng nam lựa chọn khi đến Salon. Tiết kiệm đến 30% so với sử dụng lẻ từng dịch vụ, giúp anh em sở hữu mái tóc chuẩn form Hàn Quốc dễ dàng tạo kiểu mỗi ngày.",
      tiers: [
        { name: "Combo 1: Cắt + Ép Side + Gội Massage", price: "280.000đ" },
        { name: "Combo 2: Cắt + Ép Side + Uốn Phồng / Layer", price: "450.000đ" },
        { name: "Combo 3 Full: Cắt + Ép Side + Uốn + Nhuộm Màu", price: "650.000đ" }
      ]
    }
  ],

  // ==========================================================================
  // 6. BẢNG MÀU SẮC TÓC CHI TIẾT (HAIR COLOR PALETTE)
  // ==========================================================================
  colors: [
    {
      id: "color-nau-tay-lanh",
      code: "NT-6.1",
      name: "Nâu Tây Ánh Lạnh",
      group: "Nâu Tự Nhiên & Công Sở",
      hex: "#5c4033",
      gradient: "linear-gradient(135deg, #2d1e17 0%, #6e4f3f 48%, #8f6d5a 55%, #463025 100%)",
      bleachRequired: "Không cần tẩy",
      durability: "4 - 6 tháng",
      skinTones: ["Mọi tông da", "Da ngăm", "Da trung bình", "Da trắng"],
      priceEstimate: "550.000đ - 850.000đ",
      description:
        "Tông nâu trung tính pha ánh khói lạnh nhẹ giúp triệt sắc đỏ/đồng trên nền tóc người Việt. Lên màu sang trọng, đi làm hay đi học đều phù hợp và cực kỳ tôn da."
    },
    {
      id: "color-nau-tra-sua",
      code: "TS-8.13",
      name: "Nâu Trà Sữa Hàn Quốc",
      group: "Nâu Tự Nhiên & Công Sở",
      hex: "#a68971",
      gradient: "linear-gradient(135deg, #6b5341 0%, #b89b82 48%, #d4bca6 55%, #7d634f 100%)",
      bleachRequired: "Nâng tông nhẹ (Không tẩy hoặc tẩy 1 lần tùy nền)",
      durability: "3 - 4 tháng",
      skinTones: ["Da trắng", "Da trung bình sáng"],
      priceEstimate: "700.000đ - 1.100.000đ",
      description:
        "Sắc nâu béo ngậy pha kem sữa ngọt ngào, giúp khuôn mặt sáng bừng và trẻ trung hơn ngay lập tức. Khi phai vẫn giữ được nền nâu be rất đẹp."
    },
    {
      id: "color-nau-chocolate",
      code: "CC-5.77",
      name: "Nâu Chocolate Nguyên Bản",
      group: "Nâu Tự Nhiên & Công Sở",
      hex: "#4a2c20",
      gradient: "linear-gradient(135deg, #24140e 0%, #593527 48%, #754938 55%, #331d14 100%)",
      bleachRequired: "Không cần tẩy",
      durability: "5 - 7 tháng",
      skinTones: ["Mọi tông da"],
      priceEstimate: "550.000đ - 800.000đ",
      description:
        "Màu nhuộm quốc dân tạo hiệu ứng mái tóc dày, bóng khỏe và mượt mà nhất. Cực kỳ phù hợp cho tóc vừa uốn sóng lơi hoặc tóc đang cần phục hồi."
    },
    {
      id: "color-xanh-den-khoi",
      code: "XD-2.88",
      name: "Xanh Đen Ánh Khói (Blue Black)",
      group: "Thời Trang Không Cần Tẩy",
      hex: "#1c2e4a",
      gradient: "linear-gradient(135deg, #0d1524 0%, #243e66 48%, #3c5f91 55%, #121d30 100%)",
      bleachRequired: "Không cần tẩy",
      durability: "3 - 5 tháng (Phai ra nâu rêu lạnh)",
      skinTones: ["Da trắng", "Da trung bình", "Da ngăm sáng"],
      priceEstimate: "650.000đ - 950.000đ",
      description:
        "Trong nhà nhìn trầm lịch sự như tóc đen ánh xanh, nhưng khi ra nắng hoặc dưới ánh đèn sẽ ánh lên sắc xanh biển pha khói cực kỳ cuốn hút."
    },
    {
      id: "color-do-ruou-vang",
      code: "RV-6.65",
      name: "Đỏ Rượu Vang / Đỏ Cherry Trầm",
      group: "Thời Trang Không Cần Tẩy",
      hex: "#6e1e2a",
      gradient: "linear-gradient(135deg, #380b12 0%, #872332 48%, #ab3748 55%, #4a121b 100%)",
      bleachRequired: "Không cần tẩy",
      durability: "4 - 5 tháng",
      skinTones: ["Làm trắng da bật 2 tông", "Hợp da vàng/ngăm"],
      priceEstimate: "600.000đ - 950.000đ",
      description:
        "Sắc đỏ trầm pha ánh tím rượu vang quyến rũ, giúp da mặt hồng hào và trắng sáng rõ rệt mà hoàn toàn không cần tẩy tóc."
    },
    {
      id: "color-nau-reu-lanh",
      code: "NR-6.2",
      name: "Nâu Rêu Ánh Khói",
      group: "Thời Trang Không Cần Tẩy",
      hex: "#4b533e",
      gradient: "linear-gradient(135deg, #272b20 0%, #5b664b 48%, #768263 55%, #343b2b 100%)",
      bleachRequired: "Không cần tẩy (Nâng nền nhẹ)",
      durability: "3 - 4 tháng",
      skinTones: ["Da trung bình", "Da trắng"],
      priceEstimate: "650.000đ - 950.000đ",
      description:
        "Sự pha trộn cá tính giữa nền nâu trầm và ánh xanh rêu lạnh, giúp mái tóc uốn hoặc tỉa layer nổi bật rõ từng đường nét."
    },
    {
      id: "color-nau-cam-dao",
      code: "CD-7.43",
      name: "Nâu Cam Đào (Peach Brown)",
      group: "Thời Trang Không Cần Tẩy",
      hex: "#9e533c",
      gradient: "linear-gradient(135deg, #54281b 0%, #b86248 48%, #d67e63 55%, #6e3626 100%)",
      bleachRequired: "Không cần tẩy (Nâng nền nhẹ)",
      durability: "3 - 4 tháng",
      skinTones: ["Da trắng", "Da vàng châu Á"],
      priceEstimate: "650.000đ - 950.000đ",
      description:
        "Tông màu ấm áp, tươi tắn chuẩn idol Hàn Quốc, mang lại vẻ ngoài năng động và cực ăn ảnh."
    },
    {
      id: "color-xam-khoi",
      code: "XK-9.11",
      name: "Xám Khói Ánh Bạc (Ash Grey)",
      group: "Màu Tẩy / Khói / Balayage",
      hex: "#8a8f99",
      gradient: "linear-gradient(135deg, #4b4f57 0%, #989ea8 48%, #bfc5cf 55%, #616670 100%)",
      bleachRequired: "Cần tẩy 1 - 2 lần (Kèm bọc Olaplex)",
      durability: "2 - 3 tháng (Khuyên dùng dầu gội tím)",
      skinTones: ["Da trắng", "Da trung bình sáng"],
      priceEstimate: "1.100.000đ - 1.500.000đ",
      description:
        "Đỉnh cao của dòng màu thời trang với sắc xám khói lạnh lùng, thời thượng. Có thể nhuộm nguyên đầu hoặc chải Balayage giữ chân tóc đen."
    },
    {
      id: "color-hong-pastel-khoi",
      code: "HP-9.26",
      name: "Hồng Khói Trà Sữa (Rose Milk Tea)",
      group: "Màu Tẩy / Khói / Balayage",
      hex: "#b8848f",
      gradient: "linear-gradient(135deg, #6e4850 0%, #c9939e 48%, #e3b3bd 55%, #875c65 100%)",
      bleachRequired: "Cần tẩy 1 - 2 lần",
      durability: "2 - 3 tháng (Phai ra vàng trà sữa đẹp)",
      skinTones: ["Da trắng", "Da trung bình sáng"],
      priceEstimate: "1.150.000đ - 1.600.000đ",
      description:
        "Sắc hồng pastel pha trà sữa ánh khói ngọt ngào, sang chảnh mà không bị chói, khi phai chuyển dần sang tông trà sữa be cực tây."
    },
    {
      id: "color-bach-kim-ngoc-trai",
      code: "BK-10.1",
      name: "Bạch Kim Ánh Ngọc Trai (Pearl Blonde)",
      group: "Màu Tẩy / Khói / Balayage",
      hex: "#d8cfc2",
      gradient: "linear-gradient(135deg, #8c8376 0%, #e0d8cc 48%, #f5efe6 55%, #a89f91 100%)",
      bleachRequired: "Cần tẩy 2 lần (Kèm phác đồ Olaplex)",
      durability: "3 - 4 tháng",
      skinTones: ["Da trắng sáng"],
      priceEstimate: "1.300.000đ - 1.800.000đ",
      description:
        "Màu bạch kim trong trẻo khử sạch ánh vàng đồng, phủ bóng ngọc trai sang trọng dành cho những tín đồ thời trang cá tính."
    }
  ]
};
