require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

let vercelBlobPut = null;
try {
  vercelBlobPut = require("@vercel/blob").put;
} catch (e) {
  // @vercel/blob optional fallback
}

const app = express();
const PORT = process.env.PORT || 3005;
const IS_VERCEL = Boolean(process.env.VERCEL);

const BLOB_BASE_URL = "https://mu4jfgfvaelwgfsy.public.blob.vercel-storage.com";
const STATE_BLOB_KEY = "salon_toc_state.json";
const ORDERS_BLOB_KEY = "salon_toc_orders.json";

app.use(cors());
app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ extended: true, limit: "60mb" }));
app.use(express.static(path.join(__dirname, "public")));

const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = IS_VERCEL ? "/tmp/orders.json" : path.join(DATA_DIR, "orders.json");
const CUSTOM_DATA_FILE = IS_VERCEL
  ? "/tmp/salon-custom-data.json"
  : path.join(DATA_DIR, "salon-custom-data.json");
const UPLOADS_DIR = IS_VERCEL
  ? "/tmp/uploads"
  : path.join(__dirname, "public", "images", "uploads");

if (!IS_VERCEL) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} else {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let memoryState = null;
let memoryOrders = null;
let lastCloudSync = 0;

function getDefaultConfig() {
  const defaultConfigPath = path.join(DATA_DIR, "salon-config.js");
  if (!IS_VERCEL) {
    delete require.cache[require.resolve(defaultConfigPath)];
  }
  return require(defaultConfigPath);
}

/**
 * Đồng bộ trạng thái Salon & Đơn hàng từ Vercel Cloud Blob (nếu đang chạy trên Cloud)
 */
async function syncFromCloudIfNeeded(force = false) {
  const now = Date.now();
  if (!force && now - lastCloudSync < 1500 && memoryState && memoryOrders) return;
  lastCloudSync = now;

  if (!process.env.BLOB_READ_WRITE_TOKEN && !IS_VERCEL) return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const [stateRes, ordersRes] = await Promise.all([
      fetch(`${BLOB_BASE_URL}/${STATE_BLOB_KEY}?_t=${now}`, { signal: controller.signal }).catch(() => null),
      fetch(`${BLOB_BASE_URL}/${ORDERS_BLOB_KEY}?_t=${now}`, { signal: controller.signal }).catch(() => null)
    ]);
    clearTimeout(timer);

    if (stateRes && stateRes.ok) {
      const cloudState = await stateRes.json();
      if (cloudState && Array.isArray(cloudState.hairstyles)) {
        memoryState = cloudState;
        try {
          fs.writeFileSync(CUSTOM_DATA_FILE, JSON.stringify(memoryState, null, 2), "utf8");
        } catch (e) {}
      }
    }

    if (ordersRes && ordersRes.ok) {
      const cloudOrders = await ordersRes.json();
      if (Array.isArray(cloudOrders)) {
        memoryOrders = cloudOrders;
        try {
          fs.writeFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2), "utf8");
        } catch (e) {}
      }
    }
  } catch (err) {
    // Fallback local
  }
}

function loadSalonData() {
  if (memoryState) return memoryState;
  const defaultConfig = getDefaultConfig();

  if (fs.existsSync(CUSTOM_DATA_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(CUSTOM_DATA_FILE, "utf8"));
      const mergedServices = (Array.isArray(parsed.services) ? parsed.services : defaultConfig.services).map((srv) => {
        const defSrv = defaultConfig.services.find((d) => d.id === srv.id);
        return {
          ...srv,
          gallery: Array.isArray(srv.gallery) && srv.gallery.length
            ? srv.gallery
            : (defSrv && Array.isArray(defSrv.gallery) ? defSrv.gallery : [srv.image].filter(Boolean))
        };
      });
      memoryState = {
        salonInfo: { ...defaultConfig.salonInfo, ...(parsed.salonInfo || {}) },
        notifications: { ...defaultConfig.notifications, ...(parsed.notifications || {}) },
        staff: Array.isArray(parsed.staff) ? parsed.staff : defaultConfig.staff,
        hairstyles: Array.isArray(parsed.hairstyles) ? parsed.hairstyles : defaultConfig.hairstyles,
        services: mergedServices,
        colors: Array.isArray(parsed.colors) ? parsed.colors : defaultConfig.colors
      };
      return memoryState;
    } catch (e) {}
  }

  memoryState = defaultConfig;
  return memoryState;
}

async function saveSalonData(newData) {
  memoryState = newData;
  const jsonStr = JSON.stringify(newData, null, 2);

  try {
    fs.writeFileSync(CUSTOM_DATA_FILE, jsonStr, "utf8");
  } catch (e) {}

  if (!IS_VERCEL) {
    try {
      const jsContent = `/**
 * FILE CẤU HÌNH DỮ LIỆU TRUNG TÂM - ĐƯỢC ĐỒNG BỘ TỰ ĐỘNG TỪ TRANG QUẢN TRỊ (/admin)
 */
module.exports = ${jsonStr};
`;
      fs.writeFileSync(path.join(DATA_DIR, "salon-config.js"), jsContent, "utf8");
    } catch (e) {}
  }

  if (vercelBlobPut && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await vercelBlobPut(STATE_BLOB_KEY, jsonStr, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true
      });
    } catch (err) {
      console.error("Lỗi đồng bộ Salon State lên Vercel Blob:", err.message);
    }
  }
}

function readOrders() {
  if (memoryOrders) return memoryOrders;
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      memoryOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "[]");
      return memoryOrders;
    }
  } catch (e) {}
  memoryOrders = [];
  return memoryOrders;
}

async function saveOrders(orders) {
  memoryOrders = orders;
  const jsonStr = JSON.stringify(orders, null, 2);
  try {
    fs.writeFileSync(ORDERS_FILE, jsonStr, "utf8");
  } catch (e) {}

  if (vercelBlobPut && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await vercelBlobPut(ORDERS_BLOB_KEY, jsonStr, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true
      });
    } catch (err) {
      console.error("Lỗi đồng bộ Orders lên Vercel Blob:", err.message);
    }
  }
}

function verifyAdminPass(req) {
  const data = loadSalonData();
  const expectedPass =
    process.env.ADMIN_PASSCODE ||
    (data.notifications && data.notifications.adminPasscode) ||
    "123456";
  const providedPass =
    req.headers["x-admin-passcode"] ||
    (req.body && req.body.passcode) ||
    req.query.passcode ||
    "";
  return String(providedPass) === String(expectedPass);
}

async function sendOrderNotifications(order, config) {
  const notif = config.notifications || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN || notif.telegramBotToken;
  const chatId = process.env.TELEGRAM_CHAT_ID || notif.telegramChatId;
  const zaloWebhookUrl = process.env.ZALO_WEBHOOK_URL || notif.zaloWebhookUrl;

  const typeLabel =
    order.orderType === "consult"
      ? "💬 ORDER NHÂN VIÊN TƯ VẤN"
      : "📅 ĐẶT LỊCH LÀM TÓC MỚI";

  const servicesText =
    order.selectedServices && order.selectedServices.length > 0
      ? order.selectedServices.map((s) => `• ${s.name} (${s.priceDisplay})`).join("\n")
      : "• Chưa chọn cố định (Nhờ nhân viên tư vấn thêm)";

  const messageText = [
    `🔔 <b>${typeLabel}</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🆔 <b>Mã đơn:</b> <code>${order.orderCode}</code>`,
    `👤 <b>Khách hàng:</b> ${order.customerName}`,
    `📞 <b>SĐT Khách:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✂️ <b>Nhân viên phụ trách:</b> <b>${order.staff.name}</b> (${order.staff.role})`,
    `📲 <b>SĐT Nhân viên:</b> ${order.staff.phone}`,
    `🕒 <b>Thời gian hẹn:</b> ${order.appointmentDate || "Hôm nay"} - ${order.appointmentTime || "Liên hệ sớm nhất"}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💇‍♀️ <b>Mẫu tóc quan tâm:</b> ${order.selectedHairstyle ? order.selectedHairstyle.name : "Tư vấn tại Salon"}`,
    `🎨 <b>Màu sắc đã chọn:</b> ${order.selectedColor ? `${order.selectedColor.name} (${order.selectedColor.code})` : "Chưa chọn / Tư vấn thêm"}`,
    `📋 <b>Dịch vụ đăng ký:</b>\n${servicesText}`,
    `📝 <b>Ghi chú của khách:</b> ${order.note || "Không có ghi chú"}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💬 <b>Liên hệ Zalo khách:</b> https://zalo.me/${order.customerPhone.replace(/\D/g, "")}`
  ].join("\n");

  const results = { telegram: false, zaloWebhook: false };

  if (botToken && chatId) {
    try {
      const tgUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(tgUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "HTML",
          disable_web_page_preview: true
        })
      });
      results.telegram = res.ok;
    } catch (err) {}
  }

  if (zaloWebhookUrl) {
    try {
      const res = await fetch(zaloWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_salon_order",
          order,
          summaryText: messageText.replace(/<[^>]+>/g, "")
        })
      });
      results.zaloWebhook = res.ok;
    } catch (err) {}
  }

  return results;
}

// ============================================================================
// PUBLIC API ENDPOINTS
// ============================================================================

app.get("/api/salon-data", async (req, res) => {
  try {
    await syncFromCloudIfNeeded();
    const config = loadSalonData();
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.json({
      ok: true,
      salonInfo: config.salonInfo,
      staff: config.staff,
      hairstyles: config.hairstyles,
      services: config.services,
      colors: config.colors
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    await syncFromCloudIfNeeded();
    const config = loadSalonData();
    const {
      orderType = "booking",
      customerName = "",
      customerPhone = "",
      staffId = "",
      serviceIds = [],
      hairstyleId = "",
      colorId = "",
      appointmentDate = "",
      appointmentTime = "",
      note = ""
    } = req.body || {};

    if (!customerName.trim() || !customerPhone.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Vui lòng nhập đầy đủ Họ tên và Số điện thoại của quý khách."
      });
    }

    let selectedStaff = config.staff.find((s) => s.id === staffId);
    if (!selectedStaff) {
      selectedStaff = config.staff[0] || {
        id: "default-staff",
        name: "Bộ Phận Tư Vấn Salon",
        role: "Chuyên Viên Tư Vấn",
        phone: config.salonInfo.hotline,
        zalo: config.salonInfo.zaloMain,
        avatar: ""
      };
    }

    const selectedServices = config.services.filter((srv) =>
      Array.isArray(serviceIds) ? serviceIds.includes(srv.id) : srv.id === serviceIds
    );
    const selectedHairstyle = config.hairstyles.find((h) => h.id === hairstyleId) || null;
    const selectedColor = config.colors.find((c) => c.id === colorId) || null;

    const now = new Date();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `SALON-${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${randomSuffix}`;

    const newOrder = {
      id: `${Date.now()}-${randomSuffix}`,
      orderCode,
      createdAt: now.toISOString(),
      status: "Mới tiếp nhận",
      orderType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      staff: {
        id: selectedStaff.id,
        name: selectedStaff.name,
        role: selectedStaff.role,
        level: selectedStaff.level,
        phone: selectedStaff.phone,
        zalo: selectedStaff.zalo || selectedStaff.phone,
        avatar: selectedStaff.avatar,
        shift: selectedStaff.shift
      },
      selectedServices: selectedServices.map((s) => ({
        id: s.id,
        name: s.name,
        priceDisplay: s.priceDisplay,
        price: s.price
      })),
      selectedHairstyle: selectedHairstyle
        ? {
            id: selectedHairstyle.id,
            name: selectedHairstyle.name,
            priceRange: selectedHairstyle.priceRange,
            image: selectedHairstyle.image
          }
        : null,
      selectedColor: selectedColor
        ? {
            id: selectedColor.id,
            code: selectedColor.code,
            name: selectedColor.name,
            hex: selectedColor.hex
          }
        : null,
      appointmentDate,
      appointmentTime,
      note: note.trim()
    };

    const orders = readOrders();
    orders.unshift(newOrder);
    await saveOrders(orders);

    const notifyStatus = await sendOrderNotifications(newOrder, config);

    res.json({
      ok: true,
      message: "Đặt lịch & gửi yêu cầu thành công!",
      order: newOrder,
      notifyStatus
    });
  } catch (err) {
    console.error("Lỗi tạo đơn đặt lịch:", err);
    res.status(500).json({ ok: false, error: "Lỗi máy chủ khi xử lý đơn đặt lịch." });
  }
});

// ============================================================================
// ADMIN CMS API ENDPOINTS
// ============================================================================

app.post("/api/admin/login", async (req, res) => {
  await syncFromCloudIfNeeded(true);
  if (!verifyAdminPass(req)) {
    return res.status(401).json({
      ok: false,
      error: "Mật khẩu quản trị không đúng (Mặc định: 123456)"
    });
  }
  const fullData = loadSalonData();
  res.json({ ok: true, data: fullData });
});

app.get("/api/admin/full-data", async (req, res) => {
  await syncFromCloudIfNeeded();
  if (!verifyAdminPass(req)) {
    return res.status(401).json({ ok: false, error: "Chưa đăng nhập quyền Quản trị." });
  }
  res.json({ ok: true, data: loadSalonData() });
});

app.put("/api/admin/salon-data", async (req, res) => {
  await syncFromCloudIfNeeded();
  if (!verifyAdminPass(req)) {
    return res.status(401).json({ ok: false, error: "Sai mật khẩu Quản trị." });
  }
  try {
    const current = loadSalonData();
    const incoming = req.body.data || req.body || {};

    const updated = {
      salonInfo: incoming.salonInfo || current.salonInfo,
      notifications: incoming.notifications || current.notifications,
      staff: Array.isArray(incoming.staff) ? incoming.staff : current.staff,
      hairstyles: Array.isArray(incoming.hairstyles) ? incoming.hairstyles : current.hairstyles,
      services: Array.isArray(incoming.services) ? incoming.services : current.services,
      colors: Array.isArray(incoming.colors) ? incoming.colors : current.colors
    };

    await saveSalonData(updated);
    res.json({ ok: true, message: "Đã lưu cập nhật lên Website thành công!", data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/admin/upload-image", async (req, res) => {
  if (!verifyAdminPass(req)) {
    return res.status(401).json({ ok: false, error: "Sai mật khẩu Quản trị." });
  }
  try {
    const { base64Data, fileName = "media.jpg" } = req.body || {};
    if (
      !base64Data ||
      (!base64Data.startsWith("data:image/") && !base64Data.startsWith("data:video/"))
    ) {
      return res.status(400).json({
        ok: false,
        error: "Dữ liệu phải là Hình ảnh hoặc Video ngắn (MP4/WEBM/MOV)."
      });
    }

    const matches = base64Data.match(/^data:(image|video)\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ ok: false, error: "Định dạng file tải lên không hợp lệ." });
    }

    const mediaType = matches[1]; // 'image' | 'video'
    let ext = matches[2].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "quicktime") ext = "mov";
    const buffer = Buffer.from(matches[3], "base64");

    const cleanName = path
      .basename(fileName, path.extname(fileName))
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40);
    const savedFileName = `${Date.now()}-${cleanName || "salon"}.${ext}`;

    // Nếu có Vercel Blob Token -> Upload thẳng lên Cloud để giữ ảnh/video vĩnh viễn trên Vercel
    if (vercelBlobPut && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobResult = await vercelBlobPut(`salon_uploads/${savedFileName}`, buffer, {
          access: "public",
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: `${mediaType}/${ext === "jpg" ? "jpeg" : ext}`
        });
        if (blobResult && blobResult.url) {
          return res.json({ ok: true, url: blobResult.url, mediaType });
        }
      } catch (blobErr) {
        console.warn("Fallback sang local vì lỗi Blob:", blobErr.message);
      }
    }

    // Nếu chạy trên máy tính cục bộ -> Lưu file vào public/images/uploads/
    if (!IS_VERCEL) {
      const filePath = path.join(UPLOADS_DIR, savedFileName);
      fs.writeFileSync(filePath, buffer);
      return res.json({ ok: true, url: `/images/uploads/${savedFileName}`, mediaType });
    }

    // Fallback trên Serverless
    return res.json({ ok: true, url: base64Data, mediaType });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Quản lý đơn đặt lịch
app.get("/api/orders", async (req, res) => {
  await syncFromCloudIfNeeded();
  const orders = readOrders();
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.json({ ok: true, orders });
});

app.patch("/api/orders/:id", async (req, res) => {
  await syncFromCloudIfNeeded();
  const { id } = req.params;
  const { status } = req.body || {};
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id || o.orderCode === id);
  if (idx === -1) {
    return res.status(404).json({ ok: false, error: "Không tìm thấy đơn đặt lịch." });
  }
  if (status) {
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
  }
  await saveOrders(orders);
  res.json({ ok: true, order: orders[idx] });
});

app.delete("/api/orders/:id", async (req, res) => {
  await syncFromCloudIfNeeded();
  const { id } = req.params;
  const orders = readOrders();
  const filtered = orders.filter((o) => o.id !== id && o.orderCode !== id);
  await saveOrders(filtered);
  res.json({ ok: true });
});

app.get("/orders", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "orders.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("==========================================================");
    console.log(`💇‍♀️ WEBSITE KHÁCH HÀNG:         http://localhost:${PORT}`);
    console.log(`🛠️  BÀN QUẢN TRỊ SỬA WEB/ẢNH:   http://localhost:${PORT}/admin`);
    console.log(`📋 TRANG XEM ĐƠN ĐẶT LỊCH:     http://localhost:${PORT}/orders`);
    console.log("==========================================================");
  });
}

module.exports = app;
