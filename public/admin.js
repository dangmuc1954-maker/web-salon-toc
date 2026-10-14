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
 * Nén nhẹ ảnh hoặc đọc file Video ngắn trên trình duyệt và tải lên máy chủ -> Trả về đường dẫn trên web
 */
async function uploadImageFile(file) {
  // Nếu là file Video ngắn (MP4, MOV, WEBM) -> đọc trực tiếp Base64 và gửi lên server
  if (file.type && file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      if (file.size > 45 * 1024 * 1024) {
        return reject(new Error("Video quá lớn (vui lòng chọn video ngắn dưới 45MB)."));
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-passcode": ADMIN_PASS
            },
            body: JSON.stringify({
              base64Data: ev.target.result,
              fileName: file.name || "salon-video.mp4"
            })
          });
          const data = await res.json();
          if (data.ok) resolve(data.url);
          else reject(new Error(data.error || "Upload video thất bại"));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Không thể đọc file video."));
      reader.readAsDataURL(file);
    });
  }

  // Nếu là Hình ảnh -> nén chuẩn HD và gửi lên server
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

function isVideoMedia(url = "") {
  const u = String(url).toLowerCase().trim();
  return (
    u.startsWith("data:video/") ||
    /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(u) ||
    u.includes("/video/")
  );
}

let EDITOR_GALLERY = [];

function renderEditorGalleryBox(coverInputId, coverPreviewId) {
  const wrap = document.getElementById("editorGalleryItems");
  if (!wrap) return;
  const currentCover = document.getElementById(coverInputId)
    ? document.getElementById(coverInputId).value.trim()
    : "";

  if (EDITOR_GALLERY.length === 0) {
    wrap.innerHTML = `<div style="font-size:12.5px; color:var(--text-dim); padding:8px;">Chưa có ảnh/video phụ nào. Bấm nút bên dưới để tải thêm nhiều ảnh và video ngắn!</div>`;
    return;
  }

  wrap.innerHTML = EDITOR_GALLERY.map((url, idx) => {
    const isVid = isVideoMedia(url);
    const isCover = url === currentCover;
    return `
      <div style="position:relative; width:104px; background:#0f0d0c; border:2px solid ${
        isCover ? "var(--gold-primary)" : "rgba(255,255,255,0.14)"
      }; border-radius:10px; overflow:hidden; flex-shrink:0;">
        <div style="height:82px; position:relative; background:#000;">
          ${
            isVid
              ? `<video src="${escapeHtml(url)}" muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>
                 <span style="position:absolute; top:4px; left:4px; background:rgba(220,38,38,0.9); color:#fff; font-size:9px; font-weight:700; padding:2px 5px; border-radius:4px;">🎥 VIDEO</span>`
              : `<img src="${escapeHtml(url)}" style="width:100%; height:100%; object-fit:cover;" />`
          }
          ${
            isCover
              ? `<span style="position:absolute; bottom:4px; left:4px; background:var(--gold-primary); color:#111; font-size:9px; font-weight:800; padding:1px 5px; border-radius:4px;">Ảnh Bìa</span>`
              : ""
          }
        </div>
        <div style="display:flex; border-top:1px solid rgba(255,255,255,0.08);">
          ${
            !isVid
              ? `<button type="button" onclick="setAsEditorCover(${idx}, '${coverInputId}', '${coverPreviewId}')" style="flex:1; background:transparent; border:none; color:var(--gold-light); font-size:10px; padding:5px 2px; cursor:pointer;" title="Đặt làm ảnh bìa chính">⭐ Bìa</button>`
              : `<span style="flex:1; text-align:center; font-size:10px; color:var(--text-dim); padding:5px 2px;">Clip</span>`
          }
          <button type="button" onclick="removeEditorGalleryItem(${idx}, '${coverInputId}', '${coverPreviewId}')" style="flex:1; background:transparent; border:none; color:#f87171; font-size:10px; padding:5px 2px; cursor:pointer;">🗑 Xóa</button>
        </div>
      </div>
    `;
  }).join("");
}

window.setAsEditorCover = function (idx, coverInputId, coverPreviewId) {
  const url = EDITOR_GALLERY[idx];
  if (!url) return;
  const inp = document.getElementById(coverInputId);
  const prev = document.getElementById(coverPreviewId);
  if (inp) inp.value = url;
  if (prev) prev.src = url;
  renderEditorGalleryBox(coverInputId, coverPreviewId);
};

window.removeEditorGalleryItem = function (idx, coverInputId, coverPreviewId) {
  EDITOR_GALLERY.splice(idx, 1);
  renderEditorGalleryBox(coverInputId, coverPreviewId);
};

function bindEditorGalleryControls(coverInputId, coverPreviewId) {
  renderEditorGalleryBox(coverInputId, coverPreviewId);

  const multiFileInput = document.getElementById("editorMultiMediaInput");
  const statusEl = document.getElementById("editorGalleryUploadStatus");
  const urlAddInput = document.getElementById("editorAddUrlInput");
  const urlAddBtn = document.getElementById("editorAddUrlBtn");

  if (multiFileInput) {
    multiFileInput.addEventListener("change", async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      statusEl.textContent = `⏳ Đang tải lên ${files.length} file (ảnh/video)...`;
      let successCount = 0;
      for (const f of files) {
        try {
          const uploadedUrl = await uploadImageFile(f);
          if (!EDITOR_GALLERY.includes(uploadedUrl)) {
            EDITOR_GALLERY.push(uploadedUrl);
          }
          const coverEl = document.getElementById(coverInputId);
          if (coverEl && !coverEl.value.trim() && !isVideoMedia(uploadedUrl)) {
            coverEl.value = uploadedUrl;
            const prevEl = document.getElementById(coverPreviewId);
            if (prevEl) prevEl.src = uploadedUrl;
          }
          successCount++;
          renderEditorGalleryBox(coverInputId, coverPreviewId);
        } catch (err) {
          alert(`Lỗi tải file "${f.name}": ${err.message}`);
        }
      }
      statusEl.textContent = `✅ Đã thêm thành công ${successCount} ảnh/video vào Album!`;
      multiFileInput.value = "";
    });
  }

  if (urlAddBtn && urlAddInput) {
    urlAddBtn.addEventListener("click", () => {
      const val = urlAddInput.value.trim();
      if (!val) return;
      if (!EDITOR_GALLERY.includes(val)) {
        EDITOR_GALLERY.push(val);
      }
      urlAddInput.value = "";
      renderEditorGalleryBox(coverInputId, coverPreviewId);
    });
  }
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
// 1. QUẢN LÝ MẪU TÓC (THÊM / SỬA / ALBUM NHIỀU ẢNH & VIDEO / XÓA)
// ============================================================================
function renderAdminHairstyles() {
  const list = document.getElementById("adminHairstylesList");
  list.innerHTML = FULL_DATA.hairstyles
    .map((h, idx) => {
      const galleryCount = Array.isArray(h.gallery) ? h.gallery.length : 1;
      return `
      <div class="admin-card">
        <div style="position:relative;">
          <img src="${escapeHtml(h.image)}" class="admin-card-img" alt="${escapeHtml(h.name)}" />
          <span style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.8); color:var(--gold-light); font-size:11px; font-weight:700; padding:3px 9px; border-radius:6px;">
            🎬 Album: ${galleryCount} file
          </span>
        </div>
        <div class="admin-card-body">
          <div style="font-size:11px; color:var(--gold-primary); font-weight:700;">${escapeHtml(h.category)} ${h.badge ? `• ${escapeHtml(h.badge)}` : ""}</div>
          <h3 style="font-size:16px; margin:4px 0;">${escapeHtml(h.name)}</h3>
          <div style="font-size:14px; color:var(--gold-light); font-weight:700; margin-bottom:6px;">${escapeHtml(h.priceRange)}</div>
          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(h.shortDesc)}</p>
          <div class="admin-card-actions">
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="openHairstyleEditor(${idx})">
              ✏️ Sửa / Thêm Ảnh & Video
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#f87171;" onclick="deleteHairstyle(${idx})">
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `;
    })
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

  EDITOR_GALLERY = [];
  if (item.image) EDITOR_GALLERY.push(item.image);
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach((u) => {
      if (u && !EDITOR_GALLERY.includes(u)) EDITOR_GALLERY.push(u);
    });
  }

  const staffOptions = FULL_DATA.staff
    .map(
      (s) =>
        `<option value="${escapeHtml(s.id)}" ${
          s.id === item.recommendedStylistId ? "selected" : ""
        }>${escapeHtml(s.name)} (${escapeHtml(s.role)})</option>`
    )
    .join("");

  const html = `
    <h2 style="margin-bottom:14px;">${isEdit ? "✏️ Sửa Mẫu Tóc & Album Ảnh / Video" : "➕ Thêm Mẫu Tóc Mới"}</h2>
    <form id="hairEditorForm">
      <div class="form-group">
        <label class="form-label">Ảnh Bìa Chính Của Mẫu Tóc *</label>
        <input type="text" id="editHairImage" class="form-control" value="${escapeHtml(item.image)}" required />
        <div class="upload-box">
          <img id="editHairPreview" src="${escapeHtml(item.image)}" class="upload-preview" />
          <div style="flex:1;">
            <label class="btn btn-gold btn-sm" style="cursor:pointer; margin-bottom:4px;">
              📤 Đổi Ảnh Bìa Chính
              <input type="file" id="editHairFile" accept="image/*" style="display:none;" />
            </label>
            <div style="font-size:12px; color:var(--text-muted);" id="editHairUploadStatus">Ảnh đại diện hiển thị ngoài trang chủ.</div>
          </div>
        </div>
      </div>

      <!-- KHU VỰC THÊM NHIỀU ẢNH PHỤ & VIDEO NGẮN -->
      <div class="form-group" style="background:rgba(212,175,55,0.06); border:1px solid var(--border-strong); border-radius:14px; padding:14px;">
        <label class="form-label" style="font-size:14px;">🎬 Album Nhiều Ảnh Các Góc & Video Ngắn Thực Tế</label>
        <div id="editorGalleryItems" style="display:flex; gap:10px; overflow-x:auto; padding:6px 0 10px;"></div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
          <label class="btn btn-gold btn-sm" style="cursor:pointer;">
            📸🎥 Chọn Thêm Nhiều Ảnh & Video Ngắn Từ Máy/Điện Thoại
            <input type="file" id="editorMultiMediaInput" accept="image/*,video/mp4,video/webm,video/quicktime" multiple style="display:none;" />
          </label>
        </div>

        <div style="display:flex; gap:8px; margin-top:10px;">
          <input type="text" id="editorAddUrlInput" class="form-control" style="padding:8px 12px; font-size:13px;" placeholder="Hoặc dán link Ảnh / link Video MP4 vào đây..." />
          <button type="button" id="editorAddUrlBtn" class="btn btn-outline btn-sm" style="white-space:nowrap;">+ Thêm Link</button>
        </div>
        <div id="editorGalleryUploadStatus" style="font-size:12px; color:var(--gold-light); margin-top:6px;">
          Mẹo: Anh có thể quét chọn 5-10 ảnh các góc chụp và video ngắn cùng lúc!
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
        <label class="form-label">Mô Tả Chi Tiết (Hiện khi khách bấm vào xem chi tiết mẫu tóc) *</label>
        <textarea id="editHairDetailDesc" rows="4" class="form-control" required>${escapeHtml(item.detailDesc || item.shortDesc)}</textarea>
      </div>

      <button type="submit" class="btn btn-gold" style="width:100%; padding:14px;">
        💾 Lưu Mẫu Tóc & Album Ảnh/Video Lên Website
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
    renderEditorGalleryBox("editHairImage", "editHairPreview");
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    statusEl.textContent = "⏳ Đang tải ảnh bìa lên...";
    try {
      const url = await uploadImageFile(file);
      imgInput.value = url;
      imgPreview.src = url;
      if (!EDITOR_GALLERY.includes(url)) EDITOR_GALLERY.unshift(url);
      renderEditorGalleryBox("editHairImage", "editHairPreview");
      statusEl.textContent = "✅ Đã tải ảnh bìa lên thành công!";
    } catch (err) {
      statusEl.textContent = "❌ Lỗi: " + err.message;
    }
  });

  bindEditorGalleryControls("editHairImage", "editHairPreview");

  document.getElementById("hairEditorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newImg = imgInput.value.trim();
    if (newImg && !EDITOR_GALLERY.includes(newImg)) {
      EDITOR_GALLERY.unshift(newImg);
    }

    const updatedItem = {
      ...item,
      name: document.getElementById("editHairName").value.trim(),
      category: document.getElementById("editHairCategory").value.trim(),
      priceRange: document.getElementById("editHairPrice").value.trim(),
      duration: document.getElementById("editHairDuration").value.trim(),
      badge: document.getElementById("editHairBadge").value.trim(),
      image: newImg,
      gallery: [...EDITOR_GALLERY],
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

    await saveFullDataToServer("✅ Đã lưu mẫu tóc & album ảnh/video lên Website!");
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
// 2. QUẢN LÝ DỊCH VỤ & BẢNG GIÁ (THÊM NHIỀU ẢNH & VIDEO NGẮN CHO TỪNG DỊCH VỤ)
// ============================================================================
function renderAdminServices() {
  const list = document.getElementById("adminServicesList");
  list.innerHTML = FULL_DATA.services
    .map((s, idx) => {
      const galleryCount = Array.isArray(s.gallery) ? s.gallery.length : 1;
      return `
      <div class="admin-card">
        <div style="position:relative;">
          <img src="${escapeHtml(s.image)}" class="admin-card-img" alt="${escapeHtml(s.name)}" />
          <span style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.8); color:var(--gold-light); font-size:11px; font-weight:700; padding:3px 9px; border-radius:6px;">
            🎬 Album: ${galleryCount} ảnh/video
          </span>
        </div>
        <div class="admin-card-body">
          <div style="font-size:11px; color:var(--gold-primary); font-weight:700;">${escapeHtml(s.category)}</div>
          <h3 style="font-size:16px; margin:4px 0;">${escapeHtml(s.name)}</h3>
          <div style="font-size:15px; color:var(--gold-light); font-weight:800; margin-bottom:6px;">${escapeHtml(s.priceDisplay)}</div>
          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:10px;">${escapeHtml(s.shortDesc)}</p>
          <div class="admin-card-actions">
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="openServiceEditor(${idx})">
              ✏️ Sửa Giá / Thêm Ảnh & Video
            </button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#f87171;" onclick="deleteService(${idx})">
              🗑 Xóa
            </button>
          </div>
        </div>
      </div>
    `;
    })
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
        gallery: [],
        shortDesc: "",
        detailDesc: "",
        tiers: [
          { name: "Gói Tiêu Chuẩn", price: "500.000đ" },
          { name: "Gói Cao Cấp", price: "800.000đ" }
        ]
      };

  EDITOR_GALLERY = [];
  if (item.image) EDITOR_GALLERY.push(item.image);
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach((u) => {
      if (u && !EDITOR_GALLERY.includes(u)) EDITOR_GALLERY.push(u);
    });
  }

  const tiersText = (item.tiers || [])
    .map((t) => `${t.name} | ${t.price}`)
    .join("\n");

  const html = `
    <h2 style="margin-bottom:14px;">${isEdit ? "✏️ Sửa Dịch Vụ, Bảng Giá & Album Ảnh / Video" : "➕ Thêm Dịch Vụ Mới"}</h2>
    <form id="serviceEditorForm">
      <div class="form-group">
        <label class="form-label">Ảnh Đại Diện Chính Của Dịch Vụ *</label>
        <input type="text" id="editSrvImage" class="form-control" value="${escapeHtml(item.image)}" required />
        <div class="upload-box">
          <img id="editSrvPreview" src="${escapeHtml(item.image)}" class="upload-preview" />
          <div style="flex:1;">
            <label class="btn btn-gold btn-sm" style="cursor:pointer; margin-bottom:4px;">
              📤 Đổi Ảnh Đại Diện Dịch Vụ
              <input type="file" id="editSrvFile" accept="image/*" style="display:none;" />
            </label>
            <div style="font-size:12px; color:var(--text-muted);" id="editSrvUploadStatus">Ảnh đại diện hiển thị ngoài danh sách dịch vụ.</div>
          </div>
        </div>
      </div>

      <!-- KHU VỰC THÊM NHIỀU ẢNH & VIDEO NGẮN CHO DỊCH VỤ -->
      <div class="form-group" style="background:rgba(212,175,55,0.06); border:1px solid var(--border-strong); border-radius:14px; padding:14px;">
        <label class="form-label" style="font-size:14px;">🎬 Album Nhiều Ảnh & Video Ngắn Thực Tế Của Dịch Vụ Này</label>
        <div id="editorGalleryItems" style="display:flex; gap:10px; overflow-x:auto; padding:6px 0 10px;"></div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
          <label class="btn btn-gold btn-sm" style="cursor:pointer;">
            📸🎥 Chọn Thêm Nhiều Ảnh & Video Ngắn (MP4/MOV) Từ Máy / Điện Thoại
            <input type="file" id="editorMultiMediaInput" accept="image/*,video/mp4,video/webm,video/quicktime" multiple style="display:none;" />
          </label>
        </div>

        <div style="display:flex; gap:8px; margin-top:10px;">
          <input type="text" id="editorAddUrlInput" class="form-control" style="padding:8px 12px; font-size:13px;" placeholder="Hoặc dán link Ảnh / link Video MP4 vào đây..." />
          <button type="button" id="editorAddUrlBtn" class="btn btn-outline btn-sm" style="white-space:nowrap;">+ Thêm Link</button>
        </div>
        <div id="editorGalleryUploadStatus" style="font-size:12px; color:var(--gold-light); margin-top:6px;">
          Khách bấm vào dịch vụ sẽ xem được toàn bộ album ảnh và phát video ngắn trực tiếp!
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
        💾 Lưu Dịch Vụ, Giá & Album Ảnh/Video Lên Website
      </button>
    </form>
  `;

  openEditorModal(html);

  const imgInput = document.getElementById("editSrvImage");
  const imgPreview = document.getElementById("editSrvPreview");
  const fileInput = document.getElementById("editSrvFile");
  const statusEl = document.getElementById("editSrvUploadStatus");

  imgInput.addEventListener("input", () => {
    imgPreview.src = imgInput.value;
    renderEditorGalleryBox("editSrvImage", "editSrvPreview");
  });
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    statusEl.textContent = "⏳ Đang tải ảnh lên...";
    try {
      const url = await uploadImageFile(file);
      imgInput.value = url;
      imgPreview.src = url;
      if (!EDITOR_GALLERY.includes(url)) EDITOR_GALLERY.unshift(url);
      renderEditorGalleryBox("editSrvImage", "editSrvPreview");
      statusEl.textContent = "✅ Đã tải ảnh lên thành công!";
    } catch (err) {
      statusEl.textContent = "❌ " + err.message;
    }
  });

  bindEditorGalleryControls("editSrvImage", "editSrvPreview");

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

    const newImg = imgInput.value.trim();
    if (newImg && !EDITOR_GALLERY.includes(newImg)) {
      EDITOR_GALLERY.unshift(newImg);
    }

    const updatedItem = {
      ...item,
      name: document.getElementById("editSrvName").value.trim(),
      category: document.getElementById("editSrvCat").value.trim(),
      priceDisplay: document.getElementById("editSrvPriceDisplay").value.trim(),
      originalPriceDisplay: document.getElementById("editSrvOldPrice").value.trim(),
      duration: document.getElementById("editSrvDuration").value.trim(),
      warranty: document.getElementById("editSrvWarranty").value.trim(),
      image: newImg,
      gallery: [...EDITOR_GALLERY],
      shortDesc: document.getElementById("editSrvShortDesc").value.trim(),
      detailDesc: document.getElementById("editSrvDetailDesc").value.trim(),
      tiers: parsedTiers
    };

    if (isEdit) {
      FULL_DATA.services[index] = updatedItem;
    } else {
      FULL_DATA.services.push(updatedItem);
    }

    await saveFullDataToServer("✅ Đã lưu dịch vụ & album ảnh/video!");
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
// 6. CÀI ĐẶT THÔNG TIN CHUNG CỦA SALON, LOGO/ICON, GIỚI THIỆU & TELEGRAM
// ============================================================================
function populateSettingsForm() {
  const info = FULL_DATA.salonInfo || {};
  const notif = FULL_DATA.notifications || {};

  // Nhóm A: Thương hiệu & Logo/Icon
  document.getElementById("setShortName").value = info.shortName || "";
  document.getElementById("setBrandSubtitle").value =
    info.brandSubtitle !== undefined ? info.brandSubtitle : "Hair Salon & Color Lab";
  document.getElementById("setLogoIconText").value = info.logoIconText || "✂";
  document.getElementById("setPageTitle").value = info.pageTitle || info.name || "";
  document.getElementById("setLogoImageUrl").value = info.logoImageUrl || "";
  document.getElementById("previewLogoImg").src =
    info.logoImageUrl ||
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80";
  document.getElementById("setSalonName").value = info.name || "";

  // Nhóm B: Địa chỉ, Hotline, Giờ mở cửa, Khung giờ
  document.getElementById("setHotline").value = info.hotline || "";
  document.getElementById("setOpenHours").value = info.openHours || "";
  document.getElementById("setAddress").value = info.address || "";
  document.getElementById("setTimeSlots").value = (info.timeSlots || []).join(", ");

  // Nhóm C: Phần giới thiệu đầu trang (Hero Banner)
  document.getElementById("setHeroTag").value =
    info.heroTag !== undefined
      ? info.heroTag
      : "✨ HỆ THỐNG ĐẶT LỊCH & CHỌN ĐÚNG STYLIST YÊU THÍCH";
  document.getElementById("setHeroTitlePrefix").value =
    info.heroTitlePrefix !== undefined ? info.heroTitlePrefix : "Khám Phá";
  document.getElementById("setHeroTitleHighlight").value =
    info.heroTitleHighlight !== undefined ? info.heroTitleHighlight : "Tất Cả Kiểu Tóc";
  document.getElementById("setHeroTitleSuffix").value =
    info.heroTitleSuffix !== undefined
      ? info.heroTitleSuffix
      : ", Bảng Màu & Đặt Lịch Đúng Stylist";
  document.getElementById("setDescription").value = info.description || "";

  const hero1 =
    info.heroImage1 ||
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80";
  const hero2 =
    info.heroImage2 ||
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80";
  document.getElementById("setHeroImage1").value = hero1;
  document.getElementById("previewHero1").src = hero1;
  document.getElementById("setHeroImage2").value = hero2;
  document.getElementById("previewHero2").src = hero2;

  document.getElementById("setStat1Label").value = info.stat1Label || "Mẫu Tóc Thịnh Hành";
  document.getElementById("setStat2Label").value = info.stat2Label || "Gói Dịch Vụ Minh Bạch";
  document.getElementById("setStat3Label").value = info.stat3Label || "Mã Màu Nhuộm Chuẩn";
  document.getElementById("setStat4Label").value = info.stat4Label || "Master & Senior Stylist";

  // Nhóm D: Tiêu đề & Mô tả các mục
  document.getElementById("setSecHairTitle").value =
    info.sectionHairTitle || "Xem Tất Cả Kiểu Tóc & Mô Tả Chi Tiết";
  document.getElementById("setSecHairSub").value =
    info.sectionHairSub ||
    "Bấm vào từng ảnh mẫu tóc để xem chi tiết kỹ thuật cắt/uốn/nhuộm, khuôn mặt phù hợp, thời gian làm và chọn nhân viên thực hiện.";
  document.getElementById("setSecServiceTitle").value =
    info.sectionServiceTitle || "Tất Cả Dịch Vụ Làm Tóc & Chi Tiết Giá";
  document.getElementById("setSecServiceSub").value =
    info.sectionServiceSub ||
    "Cam kết báo đúng giá theo gói dịch vụ, sử dụng thuốc chính hãng và bảo hành miễn phí rõ ràng cho từng dịch vụ.";
  document.getElementById("setSecColorTitle").value =
    info.sectionColorTitle || "Bảng Màu Sắc Tóc & Tư Vấn Tông Da";
  document.getElementById("setSecColorSub").value =
    info.sectionColorSub ||
    "Khám phá các mã màu nhuộm từ Nâu Công Sở không cần tẩy đến Balayage / Khói thời thượng. Bấm vào màu bất kỳ để xem chi tiết & chọn nhuộm.";
  document.getElementById("setSecStaffTitle").value =
    info.sectionStaffTitle || "Chọn Nhân Viên Tư Vấn & Đặt Lịch Đúng Stylist";
  document.getElementById("setSecStaffSub").value =
    info.sectionStaffSub ||
    "Mỗi Stylist có thế mạnh riêng và thông tin số điện thoại / Zalo trực tiếp. Quý khách có thể Order nhân viên tư vấn hoặc Đặt lịch đích danh nhân viên mình yêu thích.";
  document.getElementById("setSecBookingTitle").value =
    info.sectionBookingTitle || "Gửi Yêu Cầu Về Salon & Nhận SĐT Nhân Viên Ngay";
  document.getElementById("setSecBookingSub").value =
    info.sectionBookingSub ||
    "Sau khi bấm gửi, đơn của quý khách sẽ được chuyển ngay về máy chủ Salon & thông báo cho đúng nhân viên phụ trách, đồng thời hiển thị SĐT/Zalo của nhân viên đó để quý khách liên lạc trực tiếp.";
  document.getElementById("setFooterNote").value =
    info.footerNote !== undefined
      ? info.footerNote
      : "Hệ thống Đặt lịch làm tóc & Tư vấn Stylist trực tuyến 24/7.";

  // Nhóm E: Thông báo & Mật khẩu
  document.getElementById("setTgToken").value = notif.telegramBotToken || "";
  document.getElementById("setTgChatId").value = notif.telegramChatId || "";
  document.getElementById("setZaloWebhook").value = notif.zaloWebhookUrl || "";
  document.getElementById("setAdminPasscode").value = notif.adminPasscode || ADMIN_PASS;
}

function bindUploadField(fileInputId, urlInputId, previewImgId, statusId) {
  const fileEl = document.getElementById(fileInputId);
  const urlEl = document.getElementById(urlInputId);
  const previewEl = document.getElementById(previewImgId);
  const statusEl = document.getElementById(statusId);

  if (!fileEl || !urlEl) return;

  urlEl.addEventListener("input", () => {
    if (previewEl) previewEl.src = urlEl.value;
  });

  fileEl.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (statusEl) statusEl.textContent = "⏳ Đang tải ảnh lên...";
    try {
      const uploadedUrl = await uploadImageFile(file);
      urlEl.value = uploadedUrl;
      if (previewEl) previewEl.src = uploadedUrl;
      if (statusEl) statusEl.textContent = "✅ Đã tải ảnh lên thành công! Nhớ bấm Lưu ở dưới cùng.";
    } catch (err) {
      if (statusEl) statusEl.textContent = "❌ Lỗi: " + err.message;
    }
  });
}

function initSettingsForm() {
  bindUploadField("fileLogoUpload", "setLogoImageUrl", "previewLogoImg", "statusLogoUpload");
  bindUploadField("fileHero1", "setHeroImage1", "previewHero1", "statusHero1");
  bindUploadField("fileHero2", "setHeroImage2", "previewHero2", "statusHero2");

  document.getElementById("salonSettingsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPass = document.getElementById("setAdminPasscode").value.trim() || "123456";
    const parsedSlots = document
      .getElementById("setTimeSlots")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    FULL_DATA.salonInfo = {
      ...FULL_DATA.salonInfo,
      shortName: document.getElementById("setShortName").value.trim(),
      brandSubtitle: document.getElementById("setBrandSubtitle").value.trim(),
      logoIconText: document.getElementById("setLogoIconText").value.trim() || "✂",
      pageTitle: document.getElementById("setPageTitle").value.trim(),
      logoImageUrl: document.getElementById("setLogoImageUrl").value.trim(),
      name: document.getElementById("setSalonName").value.trim(),
      hotline: document.getElementById("setHotline").value.trim(),
      zaloMain: document.getElementById("setHotline").value.trim(),
      openHours: document.getElementById("setOpenHours").value.trim(),
      address: document.getElementById("setAddress").value.trim(),
      timeSlots: parsedSlots.length ? parsedSlots : FULL_DATA.salonInfo.timeSlots,
      heroTag: document.getElementById("setHeroTag").value.trim(),
      heroTitlePrefix: document.getElementById("setHeroTitlePrefix").value.trim(),
      heroTitleHighlight: document.getElementById("setHeroTitleHighlight").value.trim(),
      heroTitleSuffix: document.getElementById("setHeroTitleSuffix").value.trim(),
      description: document.getElementById("setDescription").value.trim(),
      heroImage1: document.getElementById("setHeroImage1").value.trim(),
      heroImage2: document.getElementById("setHeroImage2").value.trim(),
      stat1Label: document.getElementById("setStat1Label").value.trim(),
      stat2Label: document.getElementById("setStat2Label").value.trim(),
      stat3Label: document.getElementById("setStat3Label").value.trim(),
      stat4Label: document.getElementById("setStat4Label").value.trim(),
      sectionHairTitle: document.getElementById("setSecHairTitle").value.trim(),
      sectionHairSub: document.getElementById("setSecHairSub").value.trim(),
      sectionServiceTitle: document.getElementById("setSecServiceTitle").value.trim(),
      sectionServiceSub: document.getElementById("setSecServiceSub").value.trim(),
      sectionColorTitle: document.getElementById("setSecColorTitle").value.trim(),
      sectionColorSub: document.getElementById("setSecColorSub").value.trim(),
      sectionStaffTitle: document.getElementById("setSecStaffTitle").value.trim(),
      sectionStaffSub: document.getElementById("setSecStaffSub").value.trim(),
      sectionBookingTitle: document.getElementById("setSecBookingTitle").value.trim(),
      sectionBookingSub: document.getElementById("setSecBookingSub").value.trim(),
      footerNote: document.getElementById("setFooterNote").value.trim()
    };

    FULL_DATA.notifications = {
      ...FULL_DATA.notifications,
      telegramBotToken: document.getElementById("setTgToken").value.trim(),
      telegramChatId: document.getElementById("setTgChatId").value.trim(),
      zaloWebhookUrl: document.getElementById("setZaloWebhook").value.trim(),
      adminPasscode: newPass
    };

    const ok = await saveFullDataToServer(
      "✅ Đã lưu toàn bộ Thương hiệu, Logo, Giới thiệu, Địa chỉ & Hotline lên Website!"
    );
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
