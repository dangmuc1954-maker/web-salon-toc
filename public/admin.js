/**
 * ============================================================================
 * BÀN QUẢN TRỊ SALON (ADMIN CMS) - TỰ SỬA THÔNG TIN & ĐỔI HÌNH TRÊN WEB
 * ============================================================================
 */

let ADMIN_PASS = localStorage.getItem("SALON_ADMIN_PASS") || "123456";
let FULL_DATA = {
  salonInfo: {},
  notifications: {},
  staff: [],
  hairstyles: [],
  services: [],
  colors: []
};
let ADMIN_ORDERS = [];

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg = "✅ Đã lưu cập nhật lên Website thành công!") {
  const el = document.getElementById("toastBanner");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 3200);
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initLogin();
  initSettingsForm();
});

function initTabs() {
  document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });
}

function initLogin() {
  const form = document.getElementById("adminLoginForm");
  const input = document.getElementById("adminPassInput");
  input.value = ADMIN_PASS;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    ADMIN_PASS = input.value.trim();
    await tryLogin();
  });

  // Tự động đăng nhập nếu mật khẩu đã lưu đúng
  tryLogin(true);
}

async function tryLogin(silent = false) {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": ADMIN_PASS
      },
      body: JSON.stringify({ passcode: ADMIN_PASS })
    });
    const result = await res.json();
    if (!result.ok) {
      if (!silent) alert(result.error || "Sai mật khẩu Quản trị!");
      return;
    }
    localStorage.setItem("SALON_ADMIN_PASS", ADMIN_PASS);
    document.getElementById("loginOverlay").style.display = "none";
    FULL_DATA = result.data;
    renderAllAdminPanels();
    await loadAdminOrders();
  } catch (err) {
    if (!silent) alert("Lỗi kết nối máy chủ: " + err.message);
  }
}

async function saveFullDataToServer(toastMessage) {
  const res = await fetch("/api/admin/salon-data", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-passcode": ADMIN_PASS
    },
    body: JSON.stringify({ data: FULL_DATA })
  });
  const result = await res.json();
  if (!result.ok) {
    alert(result.error || "Lỗi khi lưu dữ liệu!");
    return false;
  }
  FULL_DATA = result.data;
  renderAllAdminPanels();
  showToast(toastMessage || "✅ Đã lưu thay đổi lên Website!");
  return true;
}

/**
 * Nén nhẹ ảnh trên trình duyệt và tải lên máy chủ -> Trả về đường dẫn ảnh trên web
 */
async function uploadImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_W = 1100;
        let w = img.width;
        let h = img.height;
        if (w > MAX_W) {
          h = Math.round((h * MAX_W) / w);
          w = MAX_W;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const base64Data = canvas.toDataURL("image/jpeg", 0.86);

        try {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-passcode": ADMIN_PASS
            },
            body: JSON.stringify({
              base64Data,
              fileName: file.name || "salon-photo.jpg"
            })
          });
          const data = await res.json();
          if (data.ok) {
            resolve(data.url);
          } else {
            reject(new Error(data.error || "Upload ảnh thất bại"));
          }
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("File không phải là hình ảnh hợp lệ."));
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderAllAdminPanels() {
  document.getElementById("countHairstyles").textContent = FULL_DATA.hairstyles.length;
  document.getElementById("countServices").textContent = FULL_DATA.services.length;
  document.getElementById("countStaff").textContent = FULL_DATA.staff.length;
  document.getElementById("countColors").textContent = FULL_DATA.colors.length;

  renderAdminHairstyles();
  renderAdminServices();
  renderAdminStaff();
  renderAdminColors();
  populateSettingsForm();
}

// ============================================================================
// 1. QUẢN LÝ MẪU TÓC (THÊM / SỬA / ĐỔI HÌNH / XÓA)
// ============================================================================
function renderAdminHairstyles() {
  const list = document.getElementById("adminHairstylesList");
  list.innerHTML = FULL_DATA.hairstyles
    .map(
      (h, idx) => `
      <div class="admin-card">
        <img src="${escapeHtml(h.image)}" class="admin-card-img" alt="${escapeHtml(h.name)}" />
        <div class="admin-card-body">
          <div style="font-size:11px; color:var(--gold-primary); font-weight:700;">${escapeHtml(h.category)} ${h.badge ? `• ${escapeHtml(h.badge)}` : ""}</div>
          <h3 style="font-size:16px; margin:4px 0;">${escapeHtml(h.name)}</h3>
          <div style="font-size:14px; color:var(--gold-light); font-weight:700; margin-bottom:6px;">${escapeHtml(h.priceRange)}</div>
          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(h.shortDesc)}</p>
          <div class="admin-card-actions">
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="openHairstyleEditor(${idx})">
              ✏️ Sửa / Đổi Hình
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#f87171;" onclick="deleteHairstyle(${idx})">
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

window.openHairstyleEditor = function (index = null) {
  const isEdit = index !== null && FULL_DATA.hairstyles[index];
  const item = isEdit
    ? FULL_DATA.hairstyles[index]
    : {
        id: "hair-" + Date.now(),
        name: "",
        category: "Tóc Nữ Uốn",
        gender: "Nữ",
        priceRange: "600.000đ - 1.100.000đ",
        duration: "120 phút",
        badge: "Mẫu Mới",
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=80",
        gallery: [],
        faceShapes: ["Mặt tròn", "Mặt trái xoan"],
        hairLength: "Ngang vai đến ngang lưng",
        recommendedColors: ["Nâu Tây", "Nâu Trà Sữa"],
        recommendedStylistId: FULL_DATA.staff[0] ? FULL_DATA.staff[0].id : "",
        recommendedServiceId: FULL_DATA.services[0] ? FULL_DATA.services[0].id : "",
        shortDesc: "",
        detailDesc: ""
      };

  const staffOptions = FULL_DATA.staff
    .map(
      (s) =>
        `<option value="${escapeHtml(s.id)}" ${
          s.id === item.recommendedStylistId ? "selected" : ""
        }>${escapeHtml(s.name)} (${escapeHtml(s.role)})</option>`
    )
    .join("");

  const html = `
    <h2 style="margin-bottom:14px;">${isEdit ? "✏️ Sửa Mẫu Tóc & Đổi Hình" : "➕ Thêm Mẫu Tóc Mới"}</h2>
    <form id="hairEditorForm">
      <div class="form-group">
        <label class="form-label">Hình Ảnh Mẫu Tóc (Chọn ảnh từ Máy tính / Điện thoại hoặc dán link)</label>
        <input type="text" id="editHairImage" class="form-control" value="${escapeHtml(item.image)}" required />
        <div class="upload-box">
          <img id="editHairPreview" src="${escapeHtml(item.image)}" class="upload-preview" />
          <div style="flex:1;">
            <label class="btn btn-gold btn-sm" style="cursor:pointer; margin-bottom:4px;">
              📤 Chọn Ảnh Từ Máy / Điện Thoại
              <input type="file" id="editHairFile" accept="image/*" style="display:none;" />
            </label>
            <div style="font-size:12px; color:var(--text-muted);" id="editHairUploadStatus">Ảnh sẽ tự động tải lên web ngay khi chọn.</div>
          </div>
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Tên Kiểu Tóc *</label>
          <input type="text" id="editHairName" class="form-control" value="${escapeHtml(item.name)}" placeholder="VD: Tóc Nữ Layer Sóng Lơi..." required />
        </div>
        <div class="form-group">
          <label class="form-label">Danh Mục Kiểu Tóc</label>
          <input type="text" id="editHairCategory" class="form-control" value="${escapeHtml(item.category)}" placeholder="VD: Tóc Nữ Uốn, Tóc Nam, Tóc Ngắn Nữ..." required />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Khoảng Giá Hiển Thị *</label>
          <input type="text" id="editHairPrice" class="form-control" value="${escapeHtml(item.priceRange)}" placeholder="VD: 650.000đ - 1.200.000đ" required />
        </div>
        <div class="form-group">
          <label class="form-label">Thời Gian Thực Hiện & Nhãn Nổi Bật</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <input type="text" id="editHairDuration" class="form-control" value="${escapeHtml(item.duration || "")}" placeholder="120 phút" />
            <input type="text" id="editHairBadge" class="form-control" value="${escapeHtml(item.badge || "")}" placeholder="Hot Trend" />
          </div>
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Khuôn Mặt Phù Hợp (Cách nhau dấu phẩy)</label>
          <input type="text" id="editHairFaces" class="form-control" value="${escapeHtml((item.faceShapes || []).join(", "))}" />
        </div>
        <div class="form-group">
          <label class="form-label">Màu Sắc Gợi Ý (Cách nhau dấu phẩy)</label>
          <input type="text" id="editHairColors" class="form-control" value="${escapeHtml((item.recommendedColors || []).join(", "))}" />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Độ Dài Tóc Phù Hợp</label>
          <input type="text" id="editHairLength" class="form-control" value="${escapeHtml(item.hairLength || "")}" />
        </div>
        <div class="form-group">
          <label class="form-label">Nhân Viên / Stylist Phụ Trách Mẫu Này</label>
          <select id="editHairStylist" class="form-control">${staffOptions}</select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Mô Tả Ngắn (Hiện ở thẻ bên ngoài) *</label>
        <textarea id="editHairShortDesc" rows="2" class="form-control" required>${escapeHtml(item.shortDesc)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Mô Tả Chi Tiết (Hiện khi khách bấm vào xem chi tiết ảnh mẫu tóc) *</label>
        <textarea id="editHairDetailDesc" rows="4" class="form-control" required>${escapeHtml(item.detailDesc || item.shortDesc)}</textarea>
      </div>

      <button type="submit" class="btn btn-gold" style="width:100%; padding:14px;">
        💾 Lưu Mẫu Tóc Lên Website
      </button>
    </form>
  `;

  openEditorModal(html);

  const imgInput = document.getElementById("editHairImage");
  const imgPreview = document.getElementById("editHairPreview");
  const fileInput = document.getElementById("editHairFile");
  const statusEl = document.getElementById("editHairUploadStatus");

  imgInput.addEventListener("input", () => {
    imgPreview.src = imgInput.value;
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    statusEl.textContent = "⏳ Đang tải ảnh lên máy chủ...";
    try {
      const url = await uploadImageFile(file);
      imgInput.value = url;
      imgPreview.src = url;
      statusEl.textContent = "✅ Đã tải ảnh lên thành công!";
    } catch (err) {
      statusEl.textContent = "❌ Lỗi: " + err.message;
    }
  });

  document.getElementById("hairEditorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newImg = imgInput.value.trim();
    const updatedItem = {
      ...item,
      name: document.getElementById("editHairName").value.trim(),
      category: document.getElementById("editHairCategory").value.trim(),
      priceRange: document.getElementById("editHairPrice").value.trim(),
      duration: document.getElementById("editHairDuration").value.trim(),
      badge: document.getElementById("editHairBadge").value.trim(),
      image: newImg,
      gallery: [newImg],
      faceShapes: document
        .getElementById("editHairFaces")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      recommendedColors: document
        .getElementById("editHairColors")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      hairLength: document.getElementById("editHairLength").value.trim(),
      recommendedStylistId: document.getElementById("editHairStylist").value,
      shortDesc: document.getElementById("editHairShortDesc").value.trim(),
      detailDesc: document.getElementById("editHairDetailDesc").value.trim()
    };

    if (isEdit) {
      FULL_DATA.hairstyles[index] = updatedItem;
    } else {
      FULL_DATA.hairstyles.unshift(updatedItem);
    }

    await saveFullDataToServer("✅ Đã lưu mẫu tóc lên Website!");
    closeEditorModal();
  });
};

window.deleteHairstyle = async function (index) {
  const item = FULL_DATA.hairstyles[index];
  if (!item || !confirm(`Anh có chắc muốn xóa mẫu tóc "${item.name}"?`)) return;
  FULL_DATA.hairstyles.splice(index, 1);
  await saveFullDataToServer("🗑 Đã xóa mẫu tóc!");
};

// ============================================================================
// 2. QUẢN LÝ DỊCH VỤ & BẢNG GIÁ (THÊM / SỬA / ĐỔI HÌNH / XÓA)
// ============================================================================
function renderAdminServices() {
  const list = document.getElementById("adminServicesList");
  list.innerHTML = FULL_DATA.services
    .map(
      (s, idx) => `
      <div class="admin-card">
        <img src="${escapeHtml(s.image)}" class="admin-card-img" alt="${escapeHtml(s.name)}" />
        <div class="admin-card-body">
          <div style="font-size:11px; color:var(--gold-primary); font-weight:700;">${escapeHtml(s.category)}</div>
          <h3 style="font-size:16px; margin:4px 0;">${escapeHtml(s.name)}</h3>
          <div style="font-size:15px; color:var(--gold-light); font-weight:800; margin-bottom:6px;">${escapeHtml(s.priceDisplay)}</div>
          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(s.shortDesc)}</p>
          <div class="admin-card-actions">
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="openServiceEditor(${idx})">
              ✏️ Sửa Giá / Đổi Hình
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#f87171;" onclick="deleteService(${idx})">
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

window.openServiceEditor = function (index = null) {
  const isEdit = index !== null && FULL_DATA.services[index];
  const item = isEdit
    ? FULL_DATA.services[index]
    : {
        id: "srv-" + Date.now(),
        name: "",
        category: "Uốn Tóc",
        price: 500000,
        priceDisplay: "500.000đ - 900.000đ",
        originalPriceDisplay: "1.100.000đ",
        duration: "90 - 120 phút",
        warranty: "Bảo hành 30 ngày",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
        shortDesc: "",
        detailDesc: "",
        tiers: [
          { name: "Gói Tiêu Chuẩn", price: "500.000đ" },
          { name: "Gói Cao Cấp", price: "800.000đ" }
        ]
      };

  const tiersText = (item.tiers || [])
    .map((t) => `${t.name} | ${t.price}`)
    .join("\n");

  const html = `
    <h2 style="margin-bottom:14px;">${isEdit ? "✏️ Sửa Dịch Vụ & Bảng Giá" : "➕ Thêm Dịch Vụ Mới"}</h2>
    <form id="serviceEditorForm">
      <div class="form-group">
        <label class="form-label">Hình Ảnh Dịch Vụ (Tải từ máy/điện thoại hoặc dán link)</label>
        <input type="text" id="editSrvImage" class="form-control" value="${escapeHtml(item.image)}" required />
        <div class="upload-box">
          <img id="editSrvPreview" src="${escapeHtml(item.image)}" class="upload-preview" />
          <div style="flex:1;">
            <label class="btn btn-gold btn-sm" style="cursor:pointer; margin-bottom:4px;">
              📤 Chọn Ảnh Từ Máy / Điện Thoại
              <input type="file" id="editSrvFile" accept="image/*" style="display:none;" />
            </label>
            <div style="font-size:12px; color:var(--text-muted);" id="editSrvUploadStatus">Hỗ trợ JPG, PNG, WEBP.</div>
          </div>
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Tên Dịch Vụ *</label>
          <input type="text" id="editSrvName" class="form-control" value="${escapeHtml(item.name)}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Nhóm Dịch Vụ *</label>
          <input type="text" id="editSrvCat" class="form-control" value="${escapeHtml(item.category)}" placeholder="VD: Cắt & Tạo Kiểu, Uốn Tóc, Nhuộm Màu..." required />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Giá Tiền Hiển Thị *</label>
          <input type="text" id="editSrvPriceDisplay" class="form-control" value="${escapeHtml(item.priceDisplay)}" placeholder="VD: 550.000đ - 1.100.000đ" required />
        </div>
        <div class="form-group">
          <label class="form-label">Giá Gốc Gạch Ngang (Nếu có khuyến mãi)</label>
          <input type="text" id="editSrvOldPrice" class="form-control" value="${escapeHtml(item.originalPriceDisplay || "")}" placeholder="VD: 1.300.000đ" />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Thời Gian Làm Dự Kiến</label>
          <input type="text" id="editSrvDuration" class="form-control" value="${escapeHtml(item.duration || "")}" />
        </div>
        <div class="form-group">
          <label class="form-label">Chế Độ Bảo Hành</label>
          <input type="text" id="editSrvWarranty" class="form-control" value="${escapeHtml(item.warranty || "")}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Các Gói Giá Chi Tiết (Mỗi dòng 1 gói theo cú pháp: Tên gói | Giá tiền)</label>
        <textarea id="editSrvTiers" rows="3" class="form-control" placeholder="Gói Chuẩn Hàn | 650.000đ&#10;Gói Cao Cấp Nhật | 900.000đ">${escapeHtml(tiersText)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Mô Tả Ngắn *</label>
        <textarea id="editSrvShortDesc" rows="2" class="form-control" required>${escapeHtml(item.shortDesc)}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Mô Tả Chi Tiết Quy Trình Dịch Vụ *</label>
        <textarea id="editSrvDetailDesc" rows="3" class="form-control" required>${escapeHtml(item.detailDesc || item.shortDesc)}</textarea>
      </div>

      <button type="submit" class="btn btn-gold" style="width:100%; padding:14px;">
        💾 Lưu Dịch Vụ & Giá Lên Website
      </button>
    </form>
  `;

  openEditorModal(html);

  const imgInput = document.getElementById("editSrvImage");
  const imgPreview = document.getElementById("editSrvPreview");
  const fileInput = document.getElementById("editSrvFile");
  const statusEl = document.getElementById("editSrvUploadStatus");

  imgInput.addEventListener("input", () => (imgPreview.src = imgInput.value));
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    statusEl.textContent = "⏳ Đang tải ảnh lên...";
    try {
      const url = await uploadImageFile(file);
      imgInput.value = url;
      imgPreview.src = url;
      statusEl.textContent = "✅ Đã tải ảnh lên thành công!";
    } catch (err) {
      statusEl.textContent = "❌ " + err.message;
    }
  });

  document.getElementById("serviceEditorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsedTiers = document
      .getElementById("editSrvTiers")
      .value.split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|");
        return {
          name: (parts[0] || "").trim(),
          price: (parts[1] || "").trim()
        };
      });

    const updatedItem = {
      ...item,
      name: document.getElementById("editSrvName").value.trim(),
      category: document.getElementById("editSrvCat").value.trim(),
      priceDisplay: document.getElementById("editSrvPriceDisplay").value.trim(),
      originalPriceDisplay: document.getElementById("editSrvOldPrice").value.trim(),
      duration: document.getElementById("editSrvDuration").value.trim(),
      warranty: document.getElementById("editSrvWarranty").value.trim(),
      image: imgInput.value.trim(),
      shortDesc: document.getElementById("editSrvShortDesc").value.trim(),
      detailDesc: document.getElementById("editSrvDetailDesc").value.trim(),
      tiers: parsedTiers
    };

    if (isEdit) {
      FULL_DATA.services[index] = updatedItem;
    } else {
      FULL_DATA.services.push(updatedItem);
    }

    await saveFullDataToServer("✅ Đã lưu dịch vụ & bảng giá!");
    closeEditorModal();
  });
};

window.deleteService = async function (index) {
  const item = FULL_DATA.services[index];
  if (!item || !confirm(`Xóa dịch vụ "${item.name}"?`)) return;
  FULL_DATA.services.splice(index, 1);
  await saveFullDataToServer("🗑 Đã xóa dịch vụ!");
};

// ============================================================================
// 3. QUẢN LÝ NHÂN VIÊN & SĐT LIÊN LẠC (THÊM / SỬA / ĐỔI HÌNH / XÓA)
// ============================================================================
function renderAdminStaff() {
  const list = document.getElementById("adminStaffList");
  list.innerHTML = FULL_DATA.staff
    .map(
      (s, idx) => `
      <div class="admin-card">
        <div style="display:flex; gap:14px; padding:16px; align-items:center; border-bottom:1px solid var(--border-subtle);">
          <img src="${escapeHtml(s.avatar)}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-primary);" />
          <div>
            <div style="font-size:11px; color:var(--gold-light); font-weight:700;">${escapeHtml(s.level)} • ${escapeHtml(s.experience)}</div>
            <h3 style="font-size:17px;">${escapeHtml(s.name)}</h3>
            <div style="font-size:12.5px; color:var(--text-muted);">${escapeHtml(s.role)}</div>
            <div style="font-size:14px; color:var(--gold-light); font-weight:700; margin-top:4px;">📞 SĐT/Zalo: ${escapeHtml(s.phone)}</div>
          </div>
        </div>
        <div class="admin-card-body">
          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(s.bio)}</p>
          <div class="admin-card-actions">
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="openStaffEditor(${idx})">
              ✏️ Sửa SĐT / Đổi Ảnh
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#f87171;" onclick="deleteStaff(${idx})">
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

window.openStaffEditor = function (index = null) {
  const isEdit = index !== null && FULL_DATA.staff[index];
  const item = isEdit
    ? FULL_DATA.staff[index]
    : {
        id: "stylist-" + Date.now(),
        name: "",
        role: "Senior Stylist",
        level: "Senior Stylist",
        experience: "5 năm kinh nghiệm",
        phone: "",
        zalo: "",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
        rating: 5.0,
        reviewsCount: 120,
        shift: "08:30 - 20:30 (T2 - CN)",
        specialties: ["Cắt Layer", "Uốn Sóng Lơi", "Nhuộm Thời Trang"],
        bio: "",
        surcharge: "Không phụ thu"
      };

  const html = `
    <h2 style="margin-bottom:14px;">${isEdit ? "✏️ Sửa Thông Tin Nhân Viên" : "➕ Thêm Nhân Viên Mới"}</h2>
    <form id="staffEditorForm">
      <div class="form-group">
        <label class="form-label">Ảnh Chân Dung Nhân Viên (Tải từ máy/điện thoại hoặc dán link)</label>
        <input type="text" id="editStaffAvatar" class="form-control" value="${escapeHtml(item.avatar)}" required />
        <div class="upload-box">
          <img id="editStaffPreview" src="${escapeHtml(item.avatar)}" class="upload-preview" style="border-radius:50%;" />
          <div style="flex:1;">
            <label class="btn btn-gold btn-sm" style="cursor:pointer; margin-bottom:4px;">
              📤 Chọn Ảnh Nhân Viên Từ Máy / Điện Thoại
              <input type="file" id="editStaffFile" accept="image/*" style="display:none;" />
            </label>
            <div style="font-size:12px; color:var(--text-muted);" id="editStaffUploadStatus">Ảnh hiển thị ở thẻ chọn Stylist và phiếu đặt lịch.</div>
          </div>
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Tên Nhân Viên / Stylist *</label>
          <input type="text" id="editStaffName" class="form-control" value="${escapeHtml(item.name)}" placeholder="VD: Stylist Hoàng Nam" required />
        </div>
        <div class="form-group">
          <label class="form-label">Chức Danh Chuyên Môn *</label>
          <input type="text" id="editStaffRole" class="form-control" value="${escapeHtml(item.role)}" placeholder="VD: Chuyên Gia Uốn & Nhuộm" required />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">📞 Số Điện Thoại Liên Hệ Trực Tiếp *</label>
          <input type="text" id="editStaffPhone" class="form-control" value="${escapeHtml(item.phone)}" placeholder="VD: 0901234567" required />
        </div>
        <div class="form-group">
          <label class="form-label">💬 Số Zalo Nhận Khách (Để trống sẽ lấy theo SĐT)</label>
          <input type="text" id="editStaffZalo" class="form-control" value="${escapeHtml(item.zalo || item.phone)}" />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Cấp Bậc & Số Năm Kinh Nghiệm</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <input type="text" id="editStaffLevel" class="form-control" value="${escapeHtml(item.level || "")}" placeholder="Master Stylist" />
            <input type="text" id="editStaffExp" class="form-control" value="${escapeHtml(item.experience || "")}" placeholder="8 năm kinh nghiệm" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Ca Làm Việc</label>
          <input type="text" id="editStaffShift" class="form-control" value="${escapeHtml(item.shift || "")}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Thế Mạnh Chuyên Môn (Cách nhau bằng dấu phẩy)</label>
        <input type="text" id="editStaffSpecs" class="form-control" value="${escapeHtml((item.specialties || []).join(", "))}" />
      </div>

      <div class="form-group">
        <label class="form-label">Giới Thiệu Ngắn Về Nhân Viên *</label>
        <textarea id="editStaffBio" rows="3" class="form-control" required>${escapeHtml(item.bio)}</textarea>
      </div>

      <button type="submit" class="btn btn-gold" style="width:100%; padding:14px;">
        💾 Lưu Thông Tin Nhân Viên Lên Website
      </button>
    </form>
  `;

  openEditorModal(html);

  const imgInput = document.getElementById("editStaffAvatar");
  const imgPreview = document.getElementById("editStaffPreview");
  const fileInput = document.getElementById("editStaffFile");
  const statusEl = document.getElementById("editStaffUploadStatus");

  imgInput.addEventListener("input", () => (imgPreview.src = imgInput.value));
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    statusEl.textContent = "⏳ Đang tải ảnh lên...";
    try {
      const url = await uploadImageFile(file);
      imgInput.value = url;
      imgPreview.src = url;
      statusEl.textContent = "✅ Đã tải ảnh lên thành công!";
    } catch (err) {
      statusEl.textContent = "❌ " + err.message;
    }
  });

  document.getElementById("staffEditorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("editStaffPhone").value.trim();
    const zalo = document.getElementById("editStaffZalo").value.trim() || phone;

    const updatedItem = {
      ...item,
      name: document.getElementById("editStaffName").value.trim(),
      role: document.getElementById("editStaffRole").value.trim(),
      phone,
      zalo,
      level: document.getElementById("editStaffLevel").value.trim(),
      experience: document.getElementById("editStaffExp").value.trim(),
      shift: document.getElementById("editStaffShift").value.trim(),
      avatar: imgInput.value.trim(),
      specialties: document
        .getElementById("editStaffSpecs")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bio: document.getElementById("editStaffBio").value.trim()
    };

    if (isEdit) {
      FULL_DATA.staff[index] = updatedItem;
    } else {
      FULL_DATA.staff.push(updatedItem);
    }

    await saveFullDataToServer("✅ Đã cập nhật thông tin nhân viên!");
    closeEditorModal();
  });
};

window.deleteStaff = async function (index) {
  const item = FULL_DATA.staff[index];
  if (!item || !confirm(`Xóa nhân viên "${item.name}"?`)) return;
  FULL_DATA.staff.splice(index, 1);
  await saveFullDataToServer("🗑 Đã xóa nhân viên!");
};

// ============================================================================
// 4. QUẢN LÝ BẢNG MÀU SẮC TÓC
// ============================================================================
function renderAdminColors() {
  const list = document.getElementById("adminColorsList");
  list.innerHTML = FULL_DATA.colors
    .map(
      (c, idx) => `
      <div class="admin-card">
        <div class="hair-swatch" style="margin:14px 14px 0; background:${c.gradient || c.hex};">
          <span class="color-code-badge">Mã: ${escapeHtml(c.code)}</span>
          <span class="color-bleach-tag">${escapeHtml(c.bleachRequired)}</span>
        </div>
        <div class="admin-card-body">
          <div style="font-size:11px; color:var(--gold-primary); font-weight:700;">${escapeHtml(c.group)}</div>
          <h3 style="font-size:16px; margin:4px 0;">${escapeHtml(c.name)}</h3>
          <div style="font-size:13px; color:var(--gold-light); margin-bottom:6px;">💰 ${escapeHtml(c.priceEstimate || "")}</div>
          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(c.description)}</p>
          <div class="admin-card-actions">
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="openColorEditor(${idx})">
              ✏️ Sửa Màu
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#f87171;" onclick="deleteColor(${idx})">
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

window.openColorEditor = function (index = null) {
  const isEdit = index !== null && FULL_DATA.colors[index];
  const item = isEdit
    ? FULL_DATA.colors[index]
    : {
        id: "color-" + Date.now(),
        code: "M-7.1",
        name: "",
        group: "Nâu Tự Nhiên & Công Sở",
        hex: "#6e4f3f",
        gradient: "",
        bleachRequired: "Không cần tẩy",
        durability: "4 - 6 tháng",
        skinTones: ["Mọi tông da"],
        priceEstimate: "600.000đ - 900.000đ",
        description: ""
      };

  const html = `
    <h2 style="margin-bottom:14px;">${isEdit ? "✏️ Sửa Mã Màu Tóc" : "➕ Thêm Màu Tóc Mới"}</h2>
    <form id="colorEditorForm">
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Tên Màu Nhuộm *</label>
          <input type="text" id="editColorName" class="form-control" value="${escapeHtml(item.name)}" placeholder="VD: Nâu Trà Sữa Ánh Khói" required />
        </div>
        <div class="form-group">
          <label class="form-label">Mã Số Thuốc / Mã Màu *</label>
          <input type="text" id="editColorCode" class="form-control" value="${escapeHtml(item.code)}" placeholder="VD: TS-8.13" required />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Chọn Tông Màu Hiển Thị Trên Bảng Màu</label>
          <input type="color" id="editColorHex" class="form-control" style="height:44px; padding:4px;" value="${escapeHtml(item.hex || "#6e4f3f")}" />
        </div>
        <div class="form-group">
          <label class="form-label">Nhóm Màu</label>
          <input type="text" id="editColorGroup" class="form-control" value="${escapeHtml(item.group)}" placeholder="Nâu Tự Nhiên & Công Sở / Thời Trang Không Cần Tẩy / Màu Tẩy..." required />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Cần Tẩy Hay Không?</label>
          <input type="text" id="editColorBleach" class="form-control" value="${escapeHtml(item.bleachRequired)}" placeholder="Không cần tẩy / Cần tẩy 1-2 lần" />
        </div>
        <div class="form-group">
          <label class="form-label">Giá Nhuộm Tham Khảo</label>
          <input type="text" id="editColorPrice" class="form-control" value="${escapeHtml(item.priceEstimate || "")}" placeholder="650.000đ - 950.000đ" />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Độ Bền Màu</label>
          <input type="text" id="editColorDurability" class="form-control" value="${escapeHtml(item.durability || "")}" />
        </div>
        <div class="form-group">
          <label class="form-label">Tông Da Phù Hợp (Cách nhau dấu phẩy)</label>
          <input type="text" id="editColorSkin" class="form-control" value="${escapeHtml((item.skinTones || []).join(", "))}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Mô Tả Chi Tiết Sắc Màu *</label>
        <textarea id="editColorDesc" rows="3" class="form-control" required>${escapeHtml(item.description)}</textarea>
      </div>

      <button type="submit" class="btn btn-gold" style="width:100%; padding:14px;">
        💾 Lưu Màu Nhuộm Lên Website
      </button>
    </form>
  `;

  openEditorModal(html);

  document.getElementById("colorEditorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const hex = document.getElementById("editColorHex").value;
    const gradient =
      item.hex === hex && item.gradient
        ? item.gradient
        : `linear-gradient(135deg, #1b1614 0%, ${hex} 50%, #d4bca6 56%, ${hex} 100%)`;

    const updatedItem = {
      ...item,
      name: document.getElementById("editColorName").value.trim(),
      code: document.getElementById("editColorCode").value.trim(),
      hex,
      gradient,
      group: document.getElementById("editColorGroup").value.trim(),
      bleachRequired: document.getElementById("editColorBleach").value.trim(),
      priceEstimate: document.getElementById("editColorPrice").value.trim(),
      durability: document.getElementById("editColorDurability").value.trim(),
      skinTones: document
        .getElementById("editColorSkin")
        .value.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: document.getElementById("editColorDesc").value.trim()
    };

    if (isEdit) {
      FULL_DATA.colors[index] = updatedItem;
    } else {
      FULL_DATA.colors.push(updatedItem);
    }

    await saveFullDataToServer("✅ Đã cập nhật Bảng màu sắc!");
    closeEditorModal();
  });
};

window.deleteColor = async function (index) {
  const item = FULL_DATA.colors[index];
  if (!item || !confirm(`Xóa màu "${item.name}"?`)) return;
  FULL_DATA.colors.splice(index, 1);
  await saveFullDataToServer("🗑 Đã xóa mã màu!");
};

// ============================================================================
// 5. QUẢN LÝ ĐƠN KHÁCH ĐẶT LỊCH NGAY TRONG BÀN QUẢN TRỊ
// ============================================================================
window.loadAdminOrders = async function () {
  const res = await fetch("/api/orders");
  const data = await res.json();
  ADMIN_ORDERS = data.orders || [];
  document.getElementById("countOrders").textContent = ADMIN_ORDERS.length;

  const wrap = document.getElementById("adminOrdersContainer");
  if (ADMIN_ORDERS.length === 0) {
    wrap.innerHTML = `<div style="padding:30px; background:var(--bg-card); border-radius:14px; text-align:center; color:var(--text-muted);">Hiện chưa có đơn đặt lịch nào.</div>`;
    return;
  }

  wrap.innerHTML = ADMIN_ORDERS.map((o) => {
    const st = o.staff || {};
    const srvNames =
      (o.selectedServices || []).map((s) => s.name).join(", ") || "Tư vấn tại Salon";
    return `
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:14px; padding:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div>
          <div style="font-size:12px; color:var(--gold-light); font-weight:700;">
            ${escapeHtml(o.orderCode)} • ${o.orderType === "consult" ? "💬 Order Tư Vấn" : "📅 Đặt Lịch Làm Tóc"} • Trạng thái: ${escapeHtml(o.status)}
          </div>
          <div style="font-size:17px; font-weight:800; margin:4px 0;">
            👤 Khách: ${escapeHtml(o.customerName)} — 📞 <a href="tel:${escapeHtml(o.customerPhone)}" style="color:var(--gold-light);">${escapeHtml(o.customerPhone)}</a>
          </div>
          <div style="font-size:13px; color:var(--text-muted);">
            ✂ Nhân viên khách chọn: <strong>${escapeHtml(st.name)}</strong> (SĐT NV: ${escapeHtml(st.phone)}) | 🕒 Hẹn: ${escapeHtml(o.appointmentDate)} ${escapeHtml(o.appointmentTime)}
          </div>
          <div style="font-size:13px; margin-top:4px;">
            💇‍♀️ Mẫu: <strong>${escapeHtml(o.selectedHairstyle ? o.selectedHairstyle.name : "Tư vấn")}</strong> | 🎨 Màu: <strong>${escapeHtml(o.selectedColor ? o.selectedColor.name : "Tư vấn")}</strong> | 📋 Dịch vụ: ${escapeHtml(srvNames)}
          </div>
          ${o.note ? `<div style="font-size:13px; color:#f3dc8a; margin-top:4px;">📝 Ghi chú: "${escapeHtml(o.note)}"</div>` : ""}
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="tel:${escapeHtml(o.customerPhone)}" class="btn btn-call btn-sm">📞 Gọi Khách</a>
          <a href="https://zalo.me/${escapeHtml((o.customerPhone || "").replace(/\D/g, ""))}" target="_blank" class="btn btn-zalo btn-sm">💬 Zalo Khách</a>
        </div>
      </div>
    `;
  }).join("");
};

// ============================================================================
// 6. CÀI ĐẶT THÔNG TIN CHUNG CỦA SALON & TELEGRAM
// ============================================================================
function populateSettingsForm() {
  const info = FULL_DATA.salonInfo || {};
  const notif = FULL_DATA.notifications || {};

  document.getElementById("setSalonName").value = info.name || "";
  document.getElementById("setShortName").value = info.shortName || "";
  document.getElementById("setHotline").value = info.hotline || "";
  document.getElementById("setOpenHours").value = info.openHours || "";
  document.getElementById("setAddress").value = info.address || "";
  document.getElementById("setDescription").value = info.description || "";

  document.getElementById("setTgToken").value = notif.telegramBotToken || "";
  document.getElementById("setTgChatId").value = notif.telegramChatId || "";
  document.getElementById("setZaloWebhook").value = notif.zaloWebhookUrl || "";
  document.getElementById("setAdminPasscode").value = notif.adminPasscode || ADMIN_PASS;
}

function initSettingsForm() {
  document.getElementById("salonSettingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPass = document.getElementById("setAdminPasscode").value.trim() || "123456";

    FULL_DATA.salonInfo = {
      ...FULL_DATA.salonInfo,
      name: document.getElementById("setSalonName").value.trim(),
      shortName: document.getElementById("setShortName").value.trim(),
      hotline: document.getElementById("setHotline").value.trim(),
      zaloMain: document.getElementById("setHotline").value.trim(),
      openHours: document.getElementById("setOpenHours").value.trim(),
      address: document.getElementById("setAddress").value.trim(),
      description: document.getElementById("setDescription").value.trim()
    };

    FULL_DATA.notifications = {
      ...FULL_DATA.notifications,
      telegramBotToken: document.getElementById("setTgToken").value.trim(),
      telegramChatId: document.getElementById("setTgChatId").value.trim(),
      zaloWebhookUrl: document.getElementById("setZaloWebhook").value.trim(),
      adminPasscode: newPass
    };

    const ok = await saveFullDataToServer("✅ Đã lưu thông tin Salon & cài đặt thông báo!");
    if (ok) {
      ADMIN_PASS = newPass;
      localStorage.setItem("SALON_ADMIN_PASS", newPass);
    }
  });
}

window.exportBackupJson = function () {
  const blob = new Blob([JSON.stringify(FULL_DATA, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `salon-backup-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

function openEditorModal(html) {
  document.getElementById("editorModalBody").innerHTML = html;
  document.getElementById("editorModal").classList.add("active");
}

window.closeEditorModal = function () {
  document.getElementById("editorModal").classList.remove("active");
};
