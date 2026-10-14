/**
 * ============================================================================
 * FRONTEND LOGIC - WEBSITE SALON TÓC
 * ============================================================================
 */

let SALON_DATA = {
  salonInfo: {},
  staff: [],
  hairstyles: [],
  services: [],
  colors: []
};

let activeHairstyleCategory = "Tất cả";
let activeServiceCategory = "Tất cả";
let activeColorGroup = "Tất cả";

// Hàm chuẩn hóa chuỗi tiếng Việt không dấu để tìm kiếm theo tên cực nhạy
function normalizeVN(str = "") {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", async () => {
  await fetchSalonData();
  initSearchHandlers();
  initBookingFormHandlers();
  initModalHandlers();
});

async function fetchSalonData() {
  try {
    const res = await fetch("/api/salon-data");
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Không tải được dữ liệu Salon");
    SALON_DATA = data;

    renderSalonBranding();
    renderHairstyleTabs();
    renderHairstyles();

    renderServiceTabs();
    renderServices();

    renderColorTabs();
    renderColors();

    renderStaff();
    populateBookingSelects();
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  }
}

function renderSalonBranding() {
  const info = SALON_DATA.salonInfo || {};

  // 1. Tiêu đề tab trình duyệt & Favicon / Icon Web
  if (info.pageTitle || info.name) {
    document.title = info.pageTitle || info.name;
  }
  const faviconEl = document.getElementById("faviconEl");
  const brandIconBox = document.getElementById("brandIconBox");

  if (info.logoImageUrl && info.logoImageUrl.trim()) {
    if (faviconEl) faviconEl.href = info.logoImageUrl.trim();
    if (brandIconBox) {
      brandIconBox.innerHTML = `<img src="${escapeHtml(info.logoImageUrl.trim())}" alt="Logo" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" />`;
      brandIconBox.style.padding = "0";
      brandIconBox.style.overflow = "hidden";
    }
  } else {
    const iconChar = (info.logoIconText || "✂").trim();
    if (brandIconBox) {
      brandIconBox.textContent = iconChar;
    }
    if (faviconEl) {
      faviconEl.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${encodeURIComponent(
        iconChar
      )}</text></svg>`;
    }
  }

  // 2. Tên thương hiệu & dòng chữ phụ chỗ "LUXE SALON - Hair Salon & Color Lab"
  if (info.shortName) document.getElementById("brandName").textContent = info.shortName;
  if (info.brandSubtitle !== undefined) {
    document.getElementById("brandSubtitle").textContent = info.brandSubtitle;
  }

  // 3. Thanh thông tin trên cùng (Địa chỉ, Giờ mở cửa, Hotline)
  if (info.address) document.getElementById("topAddress").textContent = info.address;
  if (info.openHours) document.getElementById("topHours").textContent = info.openHours;
  if (info.hotline) {
    const hotlineEl = document.getElementById("topHotline");
    hotlineEl.textContent = info.hotline;
    hotlineEl.href = `tel:${info.hotline}`;
  }

  // 4. Phần giới thiệu đầu trang (Hero Banner, Tiêu đề lớn, Mô tả giới thiệu, 2 Ảnh lớn)
  if (info.heroTag !== undefined) {
    document.getElementById("heroTagText").textContent = info.heroTag;
  }
  if (info.heroTitlePrefix !== undefined) {
    document.getElementById("heroTitlePrefix").textContent = info.heroTitlePrefix + " ";
  }
  if (info.heroTitleHighlight !== undefined) {
    document.getElementById("heroSalonName").textContent = info.heroTitleHighlight;
  }
  if (info.heroTitleSuffix !== undefined) {
    document.getElementById("heroTitleSuffix").textContent = info.heroTitleSuffix;
  }
  if (info.description !== undefined) {
    document.getElementById("heroSalonDesc").textContent = info.description;
  }
  if (info.heroImage1) {
    document.getElementById("heroImg1").src = info.heroImage1;
  }
  if (info.heroImage2) {
    document.getElementById("heroImg2").src = info.heroImage2;
  }

  // 5. Nhãn 4 ô thống kê
  if (info.stat1Label) document.getElementById("stat1Label").textContent = info.stat1Label;
  if (info.stat2Label) document.getElementById("stat2Label").textContent = info.stat2Label;
  if (info.stat3Label) document.getElementById("stat3Label").textContent = info.stat3Label;
  if (info.stat4Label) document.getElementById("stat4Label").textContent = info.stat4Label;

  document.getElementById("statHairstyles").textContent = `${SALON_DATA.hairstyles.length}+`;
  document.getElementById("statServices").textContent = `${SALON_DATA.services.length}+`;
  document.getElementById("statColors").textContent = `${SALON_DATA.colors.length}+`;
  document.getElementById("statStaff").textContent = `${SALON_DATA.staff.length}+`;

  // 6. Tiêu đề & Mô tả từng mục trên web
  if (info.sectionHairTitle) document.getElementById("secHairTitle").textContent = info.sectionHairTitle;
  if (info.sectionHairSub) document.getElementById("secHairSub").textContent = info.sectionHairSub;
  if (info.sectionServiceTitle) document.getElementById("secServiceTitle").textContent = info.sectionServiceTitle;
  if (info.sectionServiceSub) document.getElementById("secServiceSub").textContent = info.sectionServiceSub;
  if (info.sectionColorTitle) document.getElementById("secColorTitle").textContent = info.sectionColorTitle;
  if (info.sectionColorSub) document.getElementById("secColorSub").textContent = info.sectionColorSub;
  if (info.sectionStaffTitle) document.getElementById("secStaffTitle").textContent = info.sectionStaffTitle;
  if (info.sectionStaffSub) document.getElementById("secStaffSub").textContent = info.sectionStaffSub;
  if (info.sectionBookingTitle) document.getElementById("secBookingTitle").textContent = info.sectionBookingTitle;
  if (info.sectionBookingSub) document.getElementById("secBookingSub").textContent = info.sectionBookingSub;

  // 7. Chân trang (Footer)
  if (info.name) {
    document.getElementById("footerSalonName").textContent = info.name;
  }
  if (info.address || info.hotline) {
    document.getElementById("footerSalonContact").textContent =
      `Địa chỉ: ${info.address || ""} | Hotline: ${info.hotline || ""} | Giờ mở cửa: ${info.openHours || ""}`;
  }
  if (info.footerNote !== undefined) {
    document.getElementById("footerNoteText").textContent = info.footerNote;
  }
}

// Kiểm tra URL có phải là Video ngắn không
function isVideoUrl(url = "") {
  const u = String(url).toLowerCase().trim();
  return (
    u.startsWith("data:video/") ||
    /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(u) ||
    u.includes("/video/") ||
    u.includes("youtube.com/embed/")
  );
}

// Gom danh sách tất cả Ảnh + Video của 1 Mẫu tóc hoặc Dịch vụ
function getMediaList(item) {
  const list = [];
  if (item.image) list.push(item.image);
  if (Array.isArray(item.gallery)) {
    item.gallery.forEach((u) => {
      if (u && !list.includes(u)) list.push(u);
    });
  }
  if (Array.isArray(item.videos)) {
    item.videos.forEach((v) => {
      if (v && !list.includes(v)) list.push(v);
    });
  }
  return list;
}

let CURRENT_MODAL_MEDIA = [];
let CURRENT_MODAL_INDEX = 0;

function buildMediaGalleryHtml(item) {
  CURRENT_MODAL_MEDIA = getMediaList(item);
  CURRENT_MODAL_INDEX = 0;

  if (CURRENT_MODAL_MEDIA.length === 0) {
    CURRENT_MODAL_MEDIA = [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
    ];
  }

  const total = CURRENT_MODAL_MEDIA.length;
  return `
    <div>
      <div style="position:relative; border-radius:14px; overflow:hidden; background:#090807; border:1px solid var(--border-strong);">
        <div id="modalMediaStage" style="width:100%; height:380px; display:flex; align-items:center; justify-content:center;">
          ${renderMediaStageItem(CURRENT_MODAL_MEDIA[0])}
        </div>
        ${
          total > 1
            ? `
          <button type="button" onclick="stepModalMedia(-1)" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:38px; height:38px; border-radius:50%; border:1px solid var(--gold-primary); background:rgba(0,0,0,0.75); color:var(--gold-light); cursor:pointer; font-size:16px;">◀</button>
          <button type="button" onclick="stepModalMedia(1)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); width:38px; height:38px; border-radius:50%; border:1px solid var(--gold-primary); background:rgba(0,0,0,0.75); color:var(--gold-light); cursor:pointer; font-size:16px;">▶</button>
          <div id="modalMediaCounter" style="position:absolute; bottom:10px; right:12px; background:rgba(0,0,0,0.78); color:var(--gold-light); font-size:12px; font-weight:700; padding:3px 10px; border-radius:999px; border:1px solid var(--border-subtle);">
            1 / ${total}
          </div>
        `
            : ""
        }
      </div>

      ${
        total > 1
          ? `<div id="modalMediaThumbs" style="display:flex; gap:8px; margin-top:10px; overflow-x:auto; padding-bottom:4px;">
              ${CURRENT_MODAL_MEDIA.map((url, idx) => {
                const isVid = isVideoUrl(url);
                return `
                  <div
                    onclick="selectModalMedia(${idx})"
                    class="modal-thumb-item"
                    data-idx="${idx}"
                    style="position:relative; width:72px; height:72px; border-radius:9px; overflow:hidden; flex-shrink:0; cursor:pointer; border:2px solid ${
                      idx === 0 ? "var(--gold-primary)" : "rgba(255,255,255,0.15)"
                    }; background:#12100e;"
                  >
                    ${
                      isVid
                        ? `<video src="${escapeHtml(url)}" muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>
                           <span style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.45); color:#fff; font-size:18px;">▶</span>`
                        : `<img src="${escapeHtml(url)}" style="width:100%; height:100%; object-fit:cover;" />`
                    }
                  </div>
                `;
              }).join("")}
            </div>`
          : ""
      }
    </div>
  `;
}

function renderMediaStageItem(url) {
  if (isVideoUrl(url)) {
    return `<video src="${escapeHtml(url)}" controls autoplay playsinline style="width:100%; height:380px; object-fit:contain; background:#000;"></video>`;
  }
  return `<img src="${escapeHtml(url)}" style="width:100%; height:380px; object-fit:cover;" alt="Media" />`;
}

window.selectModalMedia = function (idx) {
  if (!CURRENT_MODAL_MEDIA.length) return;
  CURRENT_MODAL_INDEX = (idx + CURRENT_MODAL_MEDIA.length) % CURRENT_MODAL_MEDIA.length;
  const stage = document.getElementById("modalMediaStage");
  if (stage) {
    stage.innerHTML = renderMediaStageItem(CURRENT_MODAL_MEDIA[CURRENT_MODAL_INDEX]);
  }
  const counter = document.getElementById("modalMediaCounter");
  if (counter) {
    counter.textContent = `${CURRENT_MODAL_INDEX + 1} / ${CURRENT_MODAL_MEDIA.length}`;
  }
  document.querySelectorAll(".modal-thumb-item").forEach((el, i) => {
    el.style.borderColor =
      i === CURRENT_MODAL_INDEX ? "var(--gold-primary)" : "rgba(255,255,255,0.15)";
  });
};

window.stepModalMedia = function (delta) {
  window.selectModalMedia(CURRENT_MODAL_INDEX + delta);
};

// ============================================================================
// 1. RENDER BỘ SƯU TẬP KIỂU TÓC & MODAL CHI TIẾT MẪU TÓC
// ============================================================================
function renderHairstyleTabs() {
  const categories = ["Tất cả", ...new Set(SALON_DATA.hairstyles.map((h) => h.category))];
  const wrap = document.getElementById("hairstyleCategoryTabs");
  wrap.innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="filter-tab ${cat === activeHairstyleCategory ? "active" : ""}" data-cat="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `
    )
    .join("");

  wrap.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeHairstyleCategory = btn.getAttribute("data-cat");
      renderHairstyleTabs();
      renderHairstyles();
    });
  });
}

function renderHairstyles() {
  const query = normalizeVN(document.getElementById("hairstyleSearchInput").value);
  const grid = document.getElementById("hairstylesGrid");

  const filtered = SALON_DATA.hairstyles.filter((h) => {
    const matchCat =
      activeHairstyleCategory === "Tất cả" || h.category === activeHairstyleCategory;
    const matchQuery =
      !query ||
      normalizeVN(h.name).includes(query) ||
      normalizeVN(h.category).includes(query) ||
      normalizeVN(h.shortDesc).includes(query) ||
      normalizeVN((h.faceShapes || []).join(" ")).includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Không tìm thấy kiểu tóc phù hợp với từ khóa.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map((h) => {
      const stylist = SALON_DATA.staff.find((s) => s.id === h.recommendedStylistId);
      const mediaAll = getMediaList(h);
      const videoCount = mediaAll.filter((u) => isVideoUrl(u)).length;
      const imgCount = mediaAll.length - videoCount;
      return `
      <article class="hair-card">
        <div class="hair-card-img-wrap" onclick="openHairstyleModal('${h.id}')">
          <img src="${escapeHtml(h.image)}" alt="${escapeHtml(h.name)}" loading="lazy" />
          ${h.badge ? `<span class="hair-badge">✨ ${escapeHtml(h.badge)}</span>` : ""}
          <span class="hair-category-pill">
            📸 ${imgCount} ảnh${videoCount > 0 ? ` • 🎥 ${videoCount} video` : ""}
          </span>
        </div>
        <div class="hair-card-body">
          <h3 class="hair-card-title" onclick="openHairstyleModal('${h.id}')">${escapeHtml(h.name)}</h3>
          <div class="hair-card-price">💰 ${escapeHtml(h.priceRange)} • ⏱ ${escapeHtml(h.duration || "90 phút")}</div>
          <p class="hair-card-desc">${escapeHtml(h.shortDesc)}</p>
          <div class="hair-tags">
            ${(h.faceShapes || [])
              .slice(0, 3)
              .map((f) => `<span class="hair-tag">😊 ${escapeHtml(f)}</span>`)
              .join("")}
            ${stylist ? `<span class="hair-tag">✂ ${escapeHtml(stylist.name)}</span>` : ""}
          </div>
          <div class="hair-card-actions">
            <button type="button" class="btn btn-outline btn-sm" onclick="openHairstyleModal('${h.id}')">
              👁 Xem Ảnh & Video
            </button>
            <button type="button" class="btn btn-gold btn-sm" onclick="quickBookHairstyle('${h.id}')">
              📅 Đặt Mẫu Này
            </button>
          </div>
        </div>
      </article>
    `;
    })
    .join("");
}

window.openHairstyleModal = function (hairstyleId) {
  const h = SALON_DATA.hairstyles.find((item) => item.id === hairstyleId);
  if (!h) return;
  const stylist = SALON_DATA.staff.find((s) => s.id === h.recommendedStylistId);

  const html = `
    <div class="modal-detail-grid">
      ${buildMediaGalleryHtml(h)}
      <div>
        <div class="section-label">${escapeHtml(h.category)} • ${escapeHtml(h.gender || "Nam/Nữ")}</div>
        <h2 style="font-size:24px; margin-bottom:8px;">${escapeHtml(h.name)}</h2>
        <div style="font-size:18px; font-weight:800; color:var(--gold-light); margin-bottom:14px;">
          Giá tham khảo: ${escapeHtml(h.priceRange)}
        </div>

        <p style="color:var(--text-main); font-size:14.5px; margin-bottom:16px; line-height:1.7;">
          ${escapeHtml(h.detailDesc || h.shortDesc)}
        </p>

        <div style="background:rgba(0,0,0,0.35); border-radius:12px; padding:14px; margin-bottom:16px; font-size:13.5px;">
          <div style="margin-bottom:6px;">⏱ <strong>Thời gian thực hiện:</strong> ${escapeHtml(h.duration || "90 - 120 phút")}</div>
          <div style="margin-bottom:6px;">📏 <strong>Độ dài tóc phù hợp:</strong> ${escapeHtml(h.hairLength || "Mọi độ dài")}</div>
          <div style="margin-bottom:6px;">😊 <strong>Khuôn mặt hợp nhất:</strong> ${escapeHtml((h.faceShapes || []).join(", "))}</div>
          <div>🎨 <strong>Màu nhuộm gợi ý:</strong> ${escapeHtml((h.recommendedColors || []).join(", "))}</div>
        </div>

        ${
          stylist
            ? `<div style="display:flex; align-items:center; gap:12px; background:var(--bg-card); border:1px solid var(--border-subtle); padding:12px; border-radius:12px; margin-bottom:18px;">
                <img src="${escapeHtml(stylist.avatar)}" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border:1px solid var(--gold-primary);" />
                <div style="flex:1;">
                  <div style="font-size:12px; color:var(--gold-light);">Stylist chuyên trách gợi ý:</div>
                  <div style="font-weight:700;">${escapeHtml(stylist.name)} (${escapeHtml(stylist.role)})</div>
                  <div style="font-size:12px; color:var(--text-muted);">📞 SĐT/Zalo: ${escapeHtml(stylist.phone)}</div>
                </div>
              </div>`
            : ""
        }

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <button type="button" class="btn btn-gold" onclick="quickBookHairstyle('${h.id}', 'booking')">
            📅 Đặt Lịch Làm Mẫu Này
          </button>
          <button type="button" class="btn btn-outline" onclick="quickBookHairstyle('${h.id}', 'consult')">
            💬 Order Nhân Viên Tư Vấn
          </button>
        </div>
      </div>
    </div>
  `;
  openModal(html);
};

// ============================================================================
// 2. RENDER DỊCH VỤ & BẢNG GIÁ CHI TIẾT (CÓ ALBUM NHIỀU ẢNH & VIDEO NGẮN)
// ============================================================================
function renderServiceTabs() {
  const categories = ["Tất cả", ...new Set(SALON_DATA.services.map((s) => s.category))];
  const wrap = document.getElementById("serviceCategoryTabs");
  wrap.innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="filter-tab ${cat === activeServiceCategory ? "active" : ""}" data-cat="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `
    )
    .join("");

  wrap.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeServiceCategory = btn.getAttribute("data-cat");
      renderServiceTabs();
      renderServices();
    });
  });
}

function renderServices() {
  const query = normalizeVN(document.getElementById("serviceSearchInput").value);
  const grid = document.getElementById("servicesGrid");

  const filtered = SALON_DATA.services.filter((s) => {
    const matchCat =
      activeServiceCategory === "Tất cả" || s.category === activeServiceCategory;
    const matchQuery =
      !query ||
      normalizeVN(s.name).includes(query) ||
      normalizeVN(s.category).includes(query) ||
      normalizeVN(s.shortDesc).includes(query) ||
      normalizeVN(s.priceDisplay).includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Không tìm thấy dịch vụ phù hợp.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map((s) => {
      const mediaAll = getMediaList(s);
      const videoCount = mediaAll.filter((u) => isVideoUrl(u)).length;
      const imgCount = mediaAll.length - videoCount;

      return `
      <div class="service-card">
        <div class="service-card-top">
          <div style="position:relative; cursor:pointer;" onclick="openServiceModal('${s.id}')" title="Bấm để xem album ảnh & video thực tế">
            <img src="${escapeHtml(s.image)}" class="service-thumb" alt="${escapeHtml(s.name)}" loading="lazy" />
            <span style="position:absolute; bottom:4px; left:4px; right:4px; background:rgba(0,0,0,0.78); color:var(--gold-light); font-size:10px; font-weight:700; text-align:center; padding:2px 4px; border-radius:6px;">
              📸 ${imgCount} ảnh${videoCount > 0 ? ` • 🎥 ${videoCount} video` : ""}
            </span>
          </div>
          <div class="service-head-info">
            <span class="service-cat-badge">${escapeHtml(s.category)}</span>
            <h3 class="service-title" style="cursor:pointer;" onclick="openServiceModal('${s.id}')">${escapeHtml(s.name)}</h3>
            <div class="service-price-row">
              <span class="service-price-main">${escapeHtml(s.priceDisplay)}</span>
              ${s.originalPriceDisplay ? `<span class="service-price-old">${escapeHtml(s.originalPriceDisplay)}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="service-body">
          <p class="service-short-desc">${escapeHtml(s.shortDesc)}</p>
          ${
            s.tiers && s.tiers.length
              ? `<div class="service-tiers">
                  ${s.tiers
                    .map(
                      (t) => `
                    <div class="service-tier-item">
                      <span>• ${escapeHtml(t.name)}</span>
                      <span class="service-tier-price">${escapeHtml(t.price)}</span>
                    </div>`
                    )
                    .join("")}
                </div>`
              : ""
          }
          <div class="service-meta-row">
            <span>⏱ ${escapeHtml(s.duration || "60 - 120 phút")}</span>
            <span>🛡 ${escapeHtml(s.warranty || "Bảo hành uy tín")}</span>
          </div>
          <div class="service-actions">
            <button type="button" class="btn btn-outline btn-sm" style="flex:1;" onclick="openServiceModal('${s.id}')">
              🎬 Xem Ảnh, Video & Chi Tiết
            </button>
            <button type="button" class="btn btn-gold btn-sm" style="flex:1;" onclick="quickSelectService('${s.id}')">
              ➕ Chọn Dịch Vụ Này
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

window.openServiceModal = function (serviceId) {
  const s = SALON_DATA.services.find((item) => item.id === serviceId);
  if (!s) return;

  const html = `
    <div class="modal-detail-grid">
      ${buildMediaGalleryHtml(s)}
      <div>
        <div class="section-label">${escapeHtml(s.category)}</div>
        <h2 style="font-size:23px; margin-bottom:8px;">${escapeHtml(s.name)}</h2>
        <div style="font-size:20px; font-weight:800; color:var(--gold-light); margin-bottom:14px;">
          Bảng giá: ${escapeHtml(s.priceDisplay)}
        </div>
        <p style="font-size:14.5px; color:var(--text-main); margin-bottom:16px; line-height:1.7;">
          ${escapeHtml(s.detailDesc || s.shortDesc)}
        </p>
        ${
          s.tiers && s.tiers.length
            ? `<div style="background:rgba(0,0,0,0.4); padding:14px; border-radius:12px; margin-bottom:16px;">
                <div style="font-weight:700; color:var(--gold-light); margin-bottom:8px;">Chi tiết các gói lựa chọn:</div>
                ${s.tiers
                  .map(
                    (t) => `
                  <div class="service-tier-item">
                    <span>${escapeHtml(t.name)}</span>
                    <span class="service-tier-price">${escapeHtml(t.price)}</span>
                  </div>`
                  )
                  .join("")}
              </div>`
            : ""
        }
        <div style="font-size:13px; color:var(--text-muted); margin-bottom:18px;">
          ⏱ Thời gian: <strong>${escapeHtml(s.duration)}</strong> &nbsp;|&nbsp; 🛡 <strong>${escapeHtml(s.warranty)}</strong>
        </div>
        <button type="button" class="btn btn-gold" style="width:100%;" onclick="quickSelectService('${s.id}')">
          📅 Chọn Dịch Vụ Này & Đặt Lịch Ngay
        </button>
      </div>
    </div>
  `;
  openModal(html);
};

// ============================================================================
// 3. RENDER BẢNG MÀU SẮC TÓC TRỰC QUAN
// ============================================================================
function renderColorTabs() {
  const groups = ["Tất cả", ...new Set(SALON_DATA.colors.map((c) => c.group))];
  const wrap = document.getElementById("colorGroupTabs");
  wrap.innerHTML = groups
    .map(
      (grp) => `
      <button type="button" class="filter-tab ${grp === activeColorGroup ? "active" : ""}" data-grp="${escapeHtml(grp)}">
        ${escapeHtml(grp)}
      </button>
    `
    )
    .join("");

  wrap.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeColorGroup = btn.getAttribute("data-grp");
      renderColorTabs();
      renderColors();
    });
  });
}

function renderColors() {
  const query = normalizeVN(document.getElementById("colorSearchInput").value);
  const grid = document.getElementById("colorPaletteGrid");

  const filtered = SALON_DATA.colors.filter((c) => {
    const matchGrp = activeColorGroup === "Tất cả" || c.group === activeColorGroup;
    const matchQuery =
      !query ||
      normalizeVN(c.name).includes(query) ||
      normalizeVN(c.code).includes(query) ||
      normalizeVN(c.group).includes(query) ||
      normalizeVN(c.bleachRequired).includes(query) ||
      normalizeVN(c.description).includes(query);
    return matchGrp && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Không tìm thấy mã màu phù hợp.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (c) => `
      <div class="color-card" onclick="openColorModal('${c.id}')">
        <div class="hair-swatch" style="background: ${c.gradient || c.hex};">
          <span class="color-code-badge">Mã: ${escapeHtml(c.code)}</span>
          <span class="color-bleach-tag">${escapeHtml(c.bleachRequired)}</span>
        </div>
        <h3 class="color-name">${escapeHtml(c.name)}</h3>
        <div class="color-group-text">${escapeHtml(c.group)} • 💰 ${escapeHtml(c.priceEstimate || "")}</div>
        <p class="color-desc">${escapeHtml(c.description)}</p>
        <button type="button" class="btn btn-outline btn-sm" onclick="event.stopPropagation(); quickSelectColor('${c.id}')">
          🎨 Chọn Màu Này Khi Đặt Lịch
        </button>
      </div>
    `
    )
    .join("");
}

window.openColorModal = function (colorId) {
  const c = SALON_DATA.colors.find((item) => item.id === colorId);
  if (!c) return;

  const html = `
    <div>
      <div class="hair-swatch" style="height:140px; background: ${c.gradient || c.hex}; margin-bottom:18px;">
        <span class="color-code-badge" style="font-size:14px; padding:5px 12px;">Mã màu: ${escapeHtml(c.code)}</span>
        <span class="color-bleach-tag" style="font-size:13px; padding:5px 12px;">${escapeHtml(c.bleachRequired)}</span>
      </div>
      <div class="section-label">${escapeHtml(c.group)}</div>
      <h2 style="font-size:24px; margin-bottom:10px;">${escapeHtml(c.name)} (${escapeHtml(c.code)})</h2>
      <p style="font-size:15px; color:var(--text-main); margin-bottom:16px;">${escapeHtml(c.description)}</p>

      <div style="background:rgba(0,0,0,0.35); border-radius:12px; padding:14px; margin-bottom:18px; font-size:14px;">
        <div style="margin-bottom:6px;">✨ <strong>Yêu cầu nền tóc / Tẩy:</strong> ${escapeHtml(c.bleachRequired)}</div>
        <div style="margin-bottom:6px;">⏳ <strong>Độ bền màu trung bình:</strong> ${escapeHtml(c.durability)}</div>
        <div style="margin-bottom:6px;">👩 <strong>Tông da phù hợp:</strong> ${escapeHtml((c.skinTones || []).join(", "))}</div>
        <div>💰 <strong>Chi phí nhuộm tham khảo:</strong> <span style="color:var(--gold-light); font-weight:700;">${escapeHtml(c.priceEstimate)}</span></div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <button type="button" class="btn btn-gold" onclick="quickSelectColor('${c.id}')">
          🎨 Chọn Màu Này & Đặt Lịch
        </button>
        <button type="button" class="btn btn-outline" onclick="quickConsultColor('${c.id}')">
          💬 Nhờ Nhân Viên Tư Vấn Màu Này
        </button>
      </div>
    </div>
  `;
  openModal(html);
};

// ============================================================================
// 4. RENDER ĐỘI NGŨ NHÂN VIÊN / STYLIST (CÓ SĐT + ZALO + ORDER TƯ VẤN / ĐẶT LỊCH)
// ============================================================================
function renderStaff() {
  const query = normalizeVN(document.getElementById("staffSearchInput").value);
  const grid = document.getElementById("staffGrid");

  const filtered = SALON_DATA.staff.filter((s) => {
    return (
      !query ||
      normalizeVN(s.name).includes(query) ||
      normalizeVN(s.role).includes(query) ||
      normalizeVN(s.phone).includes(query) ||
      normalizeVN((s.specialties || []).join(" ")).includes(query)
    );
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">Không tìm thấy nhân viên phù hợp.</p>`;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (s) => `
      <div class="staff-card">
        <div class="staff-header">
          <img src="${escapeHtml(s.avatar)}" class="staff-avatar" alt="${escapeHtml(s.name)}" loading="lazy" />
          <div>
            <span class="staff-level-badge">${escapeHtml(s.level || "Stylist")} • ${escapeHtml(s.experience || "")}</span>
            <h3 class="staff-name">${escapeHtml(s.name)}</h3>
            <div class="staff-role">${escapeHtml(s.role)}</div>
            <div class="staff-rating">⭐ ${s.rating || "5.0"} (${s.reviewsCount || 150} lượt khách hài lòng)</div>
          </div>
        </div>

        <p class="staff-bio">${escapeHtml(s.bio)}</p>

        <div class="staff-specialties">
          ${(s.specialties || [])
            .map((sp) => `<span class="staff-spec-pill">✓ ${escapeHtml(sp)}</span>`)
            .join("")}
        </div>

        <div class="staff-contact-box">
          <div class="staff-contact-row">
            <span>📞 SĐT / Zalo trực tiếp:</span>
            <a href="tel:${escapeHtml(s.phone)}" class="staff-phone-highlight">${escapeHtml(s.phone)}</a>
          </div>
          <div class="staff-contact-row">
            <span>🕒 Ca làm việc:</span>
            <span>${escapeHtml(s.shift || "08:30 - 21:00")}</span>
          </div>
          <div class="staff-contact-row">
            <span>💡 Ghi chú:</span>
            <span style="color:var(--text-muted); font-size:12px;">${escapeHtml(s.surcharge || "Không phụ thu")}</span>
          </div>
        </div>

        <div class="staff-actions">
          <button type="button" class="btn btn-outline btn-sm" onclick="selectStaffForOrder('${s.id}', 'consult')">
            💬 Order Tư Vấn
          </button>
          <button type="button" class="btn btn-gold btn-sm" onclick="selectStaffForOrder('${s.id}', 'booking')">
            📅 Đặt Lịch Stylist Này
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

// ============================================================================
// 5. THANH TÌM KIẾM TOÀN CỤC THEO TÊN (INSTANT GLOBAL SEARCH)
// ============================================================================
function initSearchHandlers() {
  document
    .getElementById("hairstyleSearchInput")
    .addEventListener("input", () => renderHairstyles());
  document
    .getElementById("serviceSearchInput")
    .addEventListener("input", () => renderServices());
  document
    .getElementById("colorSearchInput")
    .addEventListener("input", () => renderColors());
  document
    .getElementById("staffSearchInput")
    .addEventListener("input", () => renderStaff());

  const globalInput = document.getElementById("globalSearchInput");
  const clearBtn = document.getElementById("globalSearchClear");
  const dropdown = document.getElementById("globalSearchDropdown");

  globalInput.addEventListener("input", () => {
    const raw = globalInput.value.trim();
    clearBtn.style.display = raw ? "block" : "none";
    if (!raw) {
      dropdown.classList.remove("active");
      return;
    }
    renderGlobalSearchDropdown(raw);
  });

  clearBtn.addEventListener("click", () => {
    globalInput.value = "";
    clearBtn.style.display = "none";
    dropdown.classList.remove("active");
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("globalSearchWrap").contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
}

function renderGlobalSearchDropdown(rawQuery) {
  const q = normalizeVN(rawQuery);
  const dropdown = document.getElementById("globalSearchDropdown");

  const matchedStaff = SALON_DATA.staff.filter(
    (s) =>
      normalizeVN(s.name).includes(q) ||
      normalizeVN(s.role).includes(q) ||
      normalizeVN(s.phone).includes(q)
  );
  const matchedHairstyles = SALON_DATA.hairstyles.filter(
    (h) =>
      normalizeVN(h.name).includes(q) ||
      normalizeVN(h.category).includes(q) ||
      normalizeVN(h.shortDesc).includes(q)
  );
  const matchedServices = SALON_DATA.services.filter(
    (s) =>
      normalizeVN(s.name).includes(q) ||
      normalizeVN(s.category).includes(q) ||
      normalizeVN(s.shortDesc).includes(q)
  );
  const matchedColors = SALON_DATA.colors.filter(
    (c) =>
      normalizeVN(c.name).includes(q) ||
      normalizeVN(c.code).includes(q) ||
      normalizeVN(c.group).includes(q)
  );

  let html = "";

  if (matchedStaff.length > 0) {
    html += `<div class="search-group-title">👨‍🎨 Nhân Viên / Stylist (${matchedStaff.length})</div>`;
    html += matchedStaff
      .map(
        (s) => `
        <div class="search-result-item" onclick="selectStaffForOrder('${s.id}', 'booking')">
          <img src="${escapeHtml(s.avatar)}" class="search-result-thumb" />
          <div class="search-result-info">
            <div class="search-result-name">${escapeHtml(s.name)} - ${escapeHtml(s.role)}</div>
            <div class="search-result-meta">📞 SĐT/Zalo: ${escapeHtml(s.phone)} • Bấm để đặt lịch</div>
          </div>
        </div>`
      )
      .join("");
  }

  if (matchedHairstyles.length > 0) {
    html += `<div class="search-group-title">💇‍♀️ Mẫu Tóc (${matchedHairstyles.length})</div>`;
    html += matchedHairstyles
      .map(
        (h) => `
        <div class="search-result-item" onclick="openHairstyleModal('${h.id}')">
          <img src="${escapeHtml(h.image)}" class="search-result-thumb" />
          <div class="search-result-info">
            <div class="search-result-name">${escapeHtml(h.name)}</div>
            <div class="search-result-meta">${escapeHtml(h.category)} • ${escapeHtml(h.priceRange)}</div>
          </div>
        </div>`
      )
      .join("");
  }

  if (matchedServices.length > 0) {
    html += `<div class="search-group-title">💎 Dịch Vụ & Giá (${matchedServices.length})</div>`;
    html += matchedServices
      .map(
        (s) => `
        <div class="search-result-item" onclick="openServiceModal('${s.id}')">
          <img src="${escapeHtml(s.image)}" class="search-result-thumb" />
          <div class="search-result-info">
            <div class="search-result-name">${escapeHtml(s.name)}</div>
            <div class="search-result-meta">Giá: ${escapeHtml(s.priceDisplay)}</div>
          </div>
        </div>`
      )
      .join("");
  }

  if (matchedColors.length > 0) {
    html += `<div class="search-group-title">🎨 Bảng Màu Tóc (${matchedColors.length})</div>`;
    html += matchedColors
      .map(
        (c) => `
        <div class="search-result-item" onclick="openColorModal('${c.id}')">
          <div class="search-result-thumb" style="background:${c.gradient || c.hex};"></div>
          <div class="search-result-info">
            <div class="search-result-name">${escapeHtml(c.name)} (${escapeHtml(c.code)})</div>
            <div class="search-result-meta">${escapeHtml(c.bleachRequired)} • ${escapeHtml(c.priceEstimate)}</div>
          </div>
        </div>`
      )
      .join("");
  }

  if (!html) {
    html = `<div style="padding:16px; color:var(--text-muted); font-size:13px;">Không tìm thấy kết quả nào cho "<strong>${escapeHtml(rawQuery)}</strong>".</div>`;
  }

  dropdown.innerHTML = html;
  dropdown.classList.add("active");
}

// ============================================================================
// 6. FORM ĐẶT LỊCH & ORDER ĐÚNG NHÂN VIÊN + XÁC NHẬN SĐT LIÊN LẠC
// ============================================================================
function populateBookingSelects() {
  const staffSelect = document.getElementById("staffSelect");
  staffSelect.innerHTML = SALON_DATA.staff
    .map(
      (s) =>
        `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} — ${escapeHtml(
          s.role
        )} (SĐT: ${escapeHtml(s.phone)})</option>`
    )
    .join("");

  staffSelect.addEventListener("change", () => renderSelectedStaffPreview());
  renderSelectedStaffPreview();

  const hairstyleSelect = document.getElementById("hairstyleSelect");
  hairstyleSelect.innerHTML =
    `<option value="">-- Nhờ nhân viên tư vấn kiểu hợp khuôn mặt --</option>` +
    SALON_DATA.hairstyles
      .map(
        (h) =>
          `<option value="${escapeHtml(h.id)}">${escapeHtml(h.name)} (${escapeHtml(
            h.priceRange
          )})</option>`
      )
      .join("");

  const colorSelect = document.getElementById("colorSelect");
  colorSelect.innerHTML =
    `<option value="">-- Chưa chọn màu / Tư vấn tại Salon --</option>` +
    SALON_DATA.colors
      .map(
        (c) =>
          `<option value="${escapeHtml(c.id)}">[${escapeHtml(c.code)}] ${escapeHtml(
            c.name
          )} — ${escapeHtml(c.bleachRequired)}</option>`
      )
      .join("");

  const srvList = document.getElementById("serviceCheckboxList");
  srvList.innerHTML = SALON_DATA.services
    .map(
      (s) => `
      <label class="service-check-item">
        <input type="checkbox" name="serviceIds" value="${escapeHtml(s.id)}" />
        <div>
          <div style="font-weight:600; color:var(--text-main);">${escapeHtml(s.name)}</div>
          <div style="color:var(--gold-light); font-size:11.5px;">${escapeHtml(s.priceDisplay)}</div>
        </div>
      </label>
    `
    )
    .join("");

  const dateInput = document.getElementById("appointmentDate");
  const todayStr = new Date().toISOString().split("T")[0];
  dateInput.value = todayStr;
  dateInput.min = todayStr;

  const timeSelect = document.getElementById("appointmentTime");
  const slots = (SALON_DATA.salonInfo && SALON_DATA.salonInfo.timeSlots) || [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00"
  ];
  timeSelect.innerHTML = slots
    .map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
    .join("");
}

function renderSelectedStaffPreview() {
  const staffId = document.getElementById("staffSelect").value;
  const s = SALON_DATA.staff.find((item) => item.id === staffId) || SALON_DATA.staff[0];
  if (!s) return;

  const preview = document.getElementById("selectedStaffPreview");
  preview.innerHTML = `
    <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--gold-primary); font-weight:700; margin-bottom:10px;">
      ✂ NHÂN VIÊN ĐANG ĐƯỢC CHỌN PHỤC VỤ BẠN
    </div>
    <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
      <img src="${escapeHtml(s.avatar)}" style="width:76px; height:76px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-primary);" />
      <div>
        <div style="font-size:18px; font-weight:800;">${escapeHtml(s.name)}</div>
        <div style="font-size:13px; color:var(--text-muted);">${escapeHtml(s.role)}</div>
        <div style="font-size:12px; color:var(--gold-light); margin-top:3px;">⭐ ${s.rating} • ${escapeHtml(s.experience)}</div>
      </div>
    </div>

    <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">
      ${escapeHtml(s.bio)}
    </p>

    <div style="background:#0f0d0c; border:1px solid var(--border-strong); border-radius:12px; padding:14px; margin-bottom:14px;">
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">Số điện thoại & Zalo liên hệ trực tiếp của nhân viên:</div>
      <div style="font-size:20px; font-weight:800; color:var(--gold-light); margin-bottom:10px;">
        📞 ${escapeHtml(s.phone)}
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <a href="tel:${escapeHtml(s.phone)}" class="btn btn-call btn-sm">📞 Gọi Ngay</a>
        <a href="https://zalo.me/${escapeHtml((s.zalo || s.phone).replace(/\D/g, ""))}" target="_blank" class="btn btn-zalo btn-sm">💬 Nhắn Zalo</a>
      </div>
    </div>

    <div style="font-size:12px; color:var(--text-dim);">
      💡 Khi bạn bấm <strong>Xác nhận gửi đơn</strong>, thông tin đặt lịch sẽ được gửi ngay về máy chủ Salon & chuyển tới <strong>${escapeHtml(s.name)}</strong>.
    </div>
  `;
}

function setOrderType(type) {
  document.getElementById("orderTypeInput").value = type;
  document
    .getElementById("btnTypeBooking")
    .classList.toggle("active", type === "booking");
  document
    .getElementById("btnTypeConsult")
    .classList.toggle("active", type === "consult");
}

window.selectStaffForOrder = function (staffId, orderType = "booking") {
  closeModal();
  document.getElementById("globalSearchDropdown").classList.remove("active");
  setOrderType(orderType);
  const staffSelect = document.getElementById("staffSelect");
  staffSelect.value = staffId;
  renderSelectedStaffPreview();
  document.getElementById("dat-lich").scrollIntoView({ behavior: "smooth" });
};

window.quickBookHairstyle = function (hairstyleId, orderType = "booking") {
  closeModal();
  const h = SALON_DATA.hairstyles.find((item) => item.id === hairstyleId);
  if (!h) return;

  setOrderType(orderType);
  document.getElementById("hairstyleSelect").value = h.id;

  if (h.recommendedStylistId) {
    document.getElementById("staffSelect").value = h.recommendedStylistId;
    renderSelectedStaffPreview();
  }

  if (h.recommendedServiceId) {
    document.querySelectorAll('input[name="serviceIds"]').forEach((cb) => {
      cb.checked = cb.value === h.recommendedServiceId;
    });
  }

  document.getElementById("dat-lich").scrollIntoView({ behavior: "smooth" });
};

window.quickSelectService = function (serviceId) {
  closeModal();
  setOrderType("booking");
  document.querySelectorAll('input[name="serviceIds"]').forEach((cb) => {
    if (cb.value === serviceId) cb.checked = true;
  });
  document.getElementById("dat-lich").scrollIntoView({ behavior: "smooth" });
};

window.quickSelectColor = function (colorId) {
  closeModal();
  setOrderType("booking");
  document.getElementById("colorSelect").value = colorId;
  document.getElementById("dat-lich").scrollIntoView({ behavior: "smooth" });
};

window.quickConsultColor = function (colorId) {
  closeModal();
  setOrderType("consult");
  document.getElementById("colorSelect").value = colorId;
  const colorDirector = SALON_DATA.staff.find((s) => s.id === "stylist-hoang-nam");
  if (colorDirector) {
    document.getElementById("staffSelect").value = colorDirector.id;
    renderSelectedStaffPreview();
  }
  document.getElementById("dat-lich").scrollIntoView({ behavior: "smooth" });
};

function initBookingFormHandlers() {
  document.getElementById("btnTypeBooking").addEventListener("click", () => setOrderType("booking"));
  document.getElementById("btnTypeConsult").addEventListener("click", () => setOrderType("consult"));

  const form = document.getElementById("bookingForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("submitBookingBtn");
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = "⏳ Đang gửi đơn về máy chủ Salon...";

    try {
      const checkedServices = Array.from(
        document.querySelectorAll('input[name="serviceIds"]:checked')
      ).map((cb) => cb.value);

      const payload = {
        orderType: document.getElementById("orderTypeInput").value,
        customerName: document.getElementById("customerName").value,
        customerPhone: document.getElementById("customerPhone").value,
        staffId: document.getElementById("staffSelect").value,
        hairstyleId: document.getElementById("hairstyleSelect").value,
        colorId: document.getElementById("colorSelect").value,
        serviceIds: checkedServices,
        appointmentDate: document.getElementById("appointmentDate").value,
        appointmentTime: document.getElementById("appointmentTime").value,
        note: document.getElementById("bookingNote").value
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "Có lỗi xảy ra, vui lòng kiểm tra lại thông tin.");
        return;
      }

      showOrderSuccessModal(data.order);
      form.reset();
      populateBookingSelects();
    } catch (err) {
      alert("Không thể kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

/**
 * Hiển thị Phiếu xác nhận đặt lịch + Thông tin SĐT / Zalo của đúng Nhân viên khách đã chọn
 */
function showOrderSuccessModal(order) {
  const staff = order.staff || {};
  const cleanZalo = (staff.zalo || staff.phone || "").replace(/\D/g, "");

  const html = `
    <div style="text-align:center; padding:10px 6px;">
      <div style="width:64px; height:64px; border-radius:50%; background:rgba(34,197,94,0.18); color:#22c55e; font-size:32px; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
        ✓
      </div>
      <div class="section-label">ĐÃ GỬI ĐƠN VỀ MÁY CHỦ SALON THÀNH CÔNG</div>
      <h2 style="font-size:24px; margin-bottom:6px;">Mã Đơn Của Bạn: <span style="color:var(--gold-light);">${escapeHtml(order.orderCode)}</span></h2>
      <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">
        Cảm ơn <strong>${escapeHtml(order.customerName)}</strong> (${escapeHtml(order.customerPhone)})! Yêu cầu của bạn đã được lưu trên hệ thống và gửi tới đúng nhân viên phụ trách.
      </p>

      <!-- THẺ THÔNG TIN LIÊN LẠC CỦA NHÂN VIÊN ĐỂ KHÁCH LIÊN HỆ NGAY -->
      <div style="background:linear-gradient(145deg, #241e1a, #171311); border:2px solid var(--gold-primary); border-radius:16px; padding:20px; text-align:left; margin-bottom:18px;">
        <div style="font-size:12px; color:var(--gold-light); font-weight:700; text-transform:uppercase; margin-bottom:12px;">
          📲 THÔNG TIN LIÊN LẠC NHÂN VIÊN PHỤ TRÁCH CỦA BẠN:
        </div>
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
          <img src="${escapeHtml(staff.avatar)}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid var(--gold-light);" />
          <div>
            <div style="font-size:19px; font-weight:800;">${escapeHtml(staff.name)}</div>
            <div style="font-size:13px; color:var(--text-muted);">${escapeHtml(staff.role || "")}</div>
            <div style="font-size:16px; font-weight:800; color:var(--gold-light); margin-top:4px;">
              📞 SĐT / Zalo: ${escapeHtml(staff.phone)}
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <a href="tel:${escapeHtml(staff.phone)}" class="btn btn-call">
            📞 Bấm Gọi Cho ${escapeHtml(staff.name)}
          </a>
          <a href="https://zalo.me/${escapeHtml(cleanZalo)}" target="_blank" class="btn btn-zalo">
            💬 Nhắn Zalo Cho Nhân Viên
          </a>
        </div>
      </div>

      <div style="background:rgba(0,0,0,0.35); border-radius:12px; padding:14px; text-align:left; font-size:13.5px; margin-bottom:18px;">
        <div>🕒 <strong>Thời gian hẹn:</strong> ${escapeHtml(order.appointmentDate || "Hôm nay")} lúc ${escapeHtml(order.appointmentTime || "Sớm nhất")}</div>
        ${order.selectedHairstyle ? `<div>💇‍♀️ <strong>Mẫu tóc đã chọn:</strong> ${escapeHtml(order.selectedHairstyle.name)}</div>` : ""}
        ${order.selectedColor ? `<div>🎨 <strong>Màu nhuộm đã chọn:</strong> ${escapeHtml(order.selectedColor.name)} (${escapeHtml(order.selectedColor.code)})</div>` : ""}
        <div>📋 <strong>Dịch vụ:</strong> ${
          order.selectedServices && order.selectedServices.length
            ? escapeHtml(order.selectedServices.map((s) => s.name).join(", "))
            : "Tư vấn trực tiếp cùng Stylist"
        }</div>
      </div>

      <button type="button" class="btn btn-outline" onclick="closeModal()">Đóng Cửa Sổ</button>
    </div>
  `;
  openModal(html);
}

// ============================================================================
// MODAL HELPERS
// ============================================================================
function initModalHandlers() {
  const modal = document.getElementById("detailModal");
  document.getElementById("detailModalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function openModal(html) {
  document.getElementById("detailModalContent").innerHTML = html;
  document.getElementById("detailModal").classList.add("active");
}

window.closeModal = function () {
  document.getElementById("detailModal").classList.remove("active");
};
