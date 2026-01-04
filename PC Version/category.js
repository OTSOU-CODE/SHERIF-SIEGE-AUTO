document.addEventListener("DOMContentLoaded", () => {
  const viewBtns = document.querySelectorAll(".view-btn");
  const grid = document.querySelector(".vehicles-grid");
  const list = document.querySelector(".vehicles-list");
  const resultsCountEl = document.querySelector(".results-count strong");
  const searchInput = document.querySelector(".filter-sidebar .search-box input");
  const clearFiltersLink = document.querySelector(".clear-filters");
  const yearMinInput = document.getElementById("yearMin");
  const yearMaxInput = document.getElementById("yearMax");
  const minYearLabel = document.getElementById("minYear");
  const maxYearLabel = document.getElementById("maxYear");
  const compareToggle = document.getElementById("compareMode");
  const compareBtn = document.querySelector(".compare-btn");

  let allVehicles = [];
  let filteredVehicles = [];
  let renderIndex = 0;
  const batchSize = 20;
  let loadingBatch = false;
  const favoritesKey = "sherif_auto_favorites";
  const favorites = new Set(JSON.parse(localStorage.getItem(favoritesKey) || "[]"));

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
    const header = [];
    const result = [];
    let i = 0;
    if (!lines.length) return result;
    const headRow = lines[0];
    let current = "";
    let inQuotes = false;
    for (let c of headRow) {
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        header.push(current);
        current = "";
      } else {
        current += c;
      }
    }
    header.push(current);
    for (i = 1; i < lines.length; i++) {
      const row = lines[i];
      const values = [];
      current = "";
      inQuotes = false;
      for (let ch of row) {
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === "," && !inQuotes) {
          values.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
      values.push(current);
      if (values.length !== header.length) continue;
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j].trim()] = values[j].trim();
      }
      result.push(obj);
    }
    return result;
  }

  function normalizeVehicle(v) {
    const brand = (v.brand || v.Brand || "").trim();
    const model = (v.model || v.Model || "").trim();
    const type = (v.type || v.Type || "").trim();
    const created = (v.created || v.Created || "").trim();
    const yearStart = parseInt(v.yearStart || v.year_start || v.YearStart || v.Start || v.From || "0", 10);
    const yearEnd = parseInt(v.yearEnd || v.year_end || v.YearEnd || v.To || v.Until || "0", 10);
    const id = (v.id || v.ID || `${brand}-${model}-${yearStart}-${yearEnd}`).trim();
    return { id, brand, model, type, created, yearStart, yearEnd };
  }

  function isNewArrival(created) {
    if (!created) return false;
    const d = new Date(created);
    if (isNaN(d.getTime())) return false;
    const diff = Date.now() - d.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 30;
  }

  function getBrandLogo(brand) {
    const map = {
      Toyota: CONFIG.images.carBrands[0],
      Honda: CONFIG.images.carBrands[1],
      BMW: CONFIG.images.carBrands[2],
      Mercedes: CONFIG.images.carBrands[3],
      Audi: CONFIG.images.carBrands[4],
    };
    return map[brand] || CONFIG.images.carBrands[0];
  }

  function vehicleCardHTML(v) {
    const favActive = favorites.has(v.id) ? "active" : "";
    const badge = isNewArrival(v.created)
      ? `<span class="badge-new">New Arrival</span>`
      : "";
    const brandLogo = getBrandLogo(v.brand);
    return `
      <div class="vehicle-card" data-id="${v.id}">
        <input type="checkbox" class="compare-checkbox" style="display: none;">
        <div class="vehicle-icon"><i class="fas fa-car"></i></div>
        ${badge}
        <h3>${v.model}</h3>
        <div class="vehicle-brand">
          <img class="brand-logo" src="${brandLogo}" alt="${v.brand}"> ${v.brand}
        </div>
        <div class="vehicle-year">${v.yearStart}-${v.yearEnd}</div>
        <div class="vehicle-actions">
          <button class="btn-view">View Details</button>
          <button class="favorite-btn ${favActive}" aria-label="Add to favorites"><i class="fas fa-heart"></i></button>
        </div>
      </div>
    `;
  }

  function vehicleListItemHTML(v) {
    const badge = isNewArrival(v.created)
      ? `<span class="badge-new">New</span>`
      : "";
    return `
      <div class="vehicle-list-item" data-id="${v.id}">
        <div class="list-icon"><i class="fas fa-car"></i></div>
        <div class="list-info">
          <h3>${v.brand} ${v.model} ${badge}</h3>
          <div class="list-meta">
            <span><i class="fas fa-calendar"></i> ${v.yearStart}-${v.yearEnd}</span>
            <span><i class="fas fa-check-circle"></i> Available</span>
          </div>
        </div>
        <button class="btn-view">View Details</button>
      </div>
    `;
  }

  function showSkeleton(count) {
    grid.innerHTML = "";
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(`
        <div class="vehicle-card skeleton">
          <div class="vehicle-icon"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      `);
    }
    grid.innerHTML = items.join("");
  }

  function renderBatch(reset) {
    if (reset) {
      renderIndex = 0;
      grid.innerHTML = "";
      list.innerHTML = "";
    }
    const next = filteredVehicles.slice(renderIndex, renderIndex + batchSize);
    const gridHTML = next.map(vehicleCardHTML).join("");
    const listHTML = next.map(vehicleListItemHTML).join("");
    grid.insertAdjacentHTML("beforeend", gridHTML);
    list.insertAdjacentHTML("beforeend", listHTML);
    renderIndex += next.length;
    attachCardEvents();
  }

  function attachCardEvents() {
    const cards = grid.querySelectorAll(".vehicle-card");
    cards.forEach((card) => {
      const favBtn = card.querySelector(".favorite-btn");
      if (favBtn) {
        favBtn.addEventListener("click", () => {
          const id = card.getAttribute("data-id");
          if (favorites.has(id)) {
            favorites.delete(id);
            favBtn.classList.remove("active");
          } else {
            favorites.add(id);
            favBtn.classList.add("active");
          }
          localStorage.setItem(favoritesKey, JSON.stringify(Array.from(favorites)));
        });
      }
    });
  }

  function updateResultsCount() {
    if (resultsCountEl) resultsCountEl.textContent = String(filteredVehicles.length);
  }

  function showEmptyState() {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-search"></i></div>
        <p>No vehicles match your filters</p>
        <button class="btn-clear-all">Clear All Filters</button>
      </div>
    `;
    const btn = grid.querySelector(".btn-clear-all");
    if (btn) {
      btn.addEventListener("click", () => {
        clearAllFilters();
      });
    }
  }

  function getActiveBrandFilters() {
    const ids = ["toyota", "honda", "bmw", "mercedes", "audi"];
    const active = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) active.push(id);
    });
    const map = {
      toyota: "Toyota",
      honda: "Honda",
      bmw: "BMW",
      mercedes: "Mercedes",
      audi: "Audi",
    };
    return active.map((k) => map[k]);
  }

  function getActiveTypeFilters() {
    const ids = ["sedan", "suv", "truck"];
    const map = { sedan: "Sedan", suv: "SUV", truck: "Truck" };
    const active = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) active.push(map[id]);
    });
    return active;
  }

  function applyFilters() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const minYear = parseInt(yearMinInput?.value || "0", 10);
    const maxYear = parseInt(yearMaxInput?.value || "9999", 10);
    const brands = getActiveBrandFilters();
    const types = getActiveTypeFilters();
    filteredVehicles = allVehicles.filter((v) => {
      const inText =
        !q ||
        v.model.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q);
      const inBrand = !brands.length || brands.includes(v.brand);
      const inType = !types.length || types.includes(v.type);
      const inYear =
        (!minYear || v.yearEnd >= minYear) &&
        (!maxYear || v.yearStart <= maxYear);
      return inText && inBrand && inType && inYear;
    });
    updateResultsCount();
    if (!filteredVehicles.length) {
      showEmptyState();
    } else {
      renderBatch(true);
    }
  }

  function clearAllFilters() {
    if (searchInput) searchInput.value = "";
    const brandIds = ["toyota", "honda", "bmw", "mercedes", "audi"];
    brandIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    const typeIds = ["sedan", "suv", "truck"];
    typeIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    if (yearMinInput) yearMinInput.value = String(yearMinInput.min || "2010");
    if (yearMaxInput) yearMaxInput.value = String(yearMaxInput.max || "2024");
    if (minYearLabel) minYearLabel.textContent = yearMinInput.value;
    if (maxYearLabel) maxYearLabel.textContent = yearMaxInput.value;
    applyFilters();
  }

  function onScrollLoadMore() {
    if (loadingBatch) return;
    const scrollPos = window.scrollY + window.innerHeight;
    const threshold = document.body.offsetHeight - 300;
    if (scrollPos >= threshold && renderIndex < filteredVehicles.length) {
      loadingBatch = true;
      renderBatch(false);
      loadingBatch = false;
    }
  }

  function setupViewToggle() {
    if (viewBtns.length && grid && list) {
      viewBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
          viewBtns.forEach((b) => b.classList.remove("active"));
          this.classList.add("active");
          const view = this.dataset.view;
          if (view === "list") {
            grid.style.display = "none";
            list.classList.add("active");
          } else {
            grid.style.display = "grid";
            list.classList.remove("active");
            grid.className = "vehicles-grid";
            if (view === "grid-3") grid.classList.add("cols-3");
          }
        });
      });
    }
  }

  function setupCompareMode() {
    const checkboxes = document.querySelectorAll(".compare-checkbox");
    if (compareToggle) {
      compareToggle.addEventListener("change", function () {
        checkboxes.forEach((cb) => {
          cb.style.display = this.checked ? "block" : "none";
        });
        if (this.checked) {
          if (compareBtn) compareBtn.classList.add("active");
        } else {
          if (compareBtn) compareBtn.classList.remove("active");
          checkboxes.forEach((cb) => (cb.checked = false));
          updateCompareCount();
        }
      });
    }
    function updateCompareCount() {
      const checkedCount = document.querySelectorAll(".compare-checkbox:checked").length;
      if (compareBtn) {
        compareBtn.textContent = `Compare Selected (${checkedCount})`;
      }
    }
    checkboxes.forEach((cb) => {
      cb.addEventListener("change", () => {
        const count = document.querySelectorAll(".compare-checkbox:checked").length;
        if (compareBtn) compareBtn.textContent = `Compare Selected (${count})`;
      });
    });
  }

  function setupFilters() {
    if (searchInput) {
      searchInput.addEventListener("input", () => applyFilters());
    }
    const brandIds = ["toyota", "honda", "bmw", "mercedes", "audi"];
    brandIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", applyFilters);
    });
    const typeIds = ["sedan", "suv", "truck"];
    typeIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", applyFilters);
    });
    if (yearMinInput && yearMaxInput) {
      const syncLabels = () => {
        if (minYearLabel) minYearLabel.textContent = yearMinInput.value;
        if (maxYearLabel) maxYearLabel.textContent = yearMaxInput.value;
      };
      yearMinInput.addEventListener("input", () => {
        syncLabels();
        applyFilters();
      });
      yearMaxInput.addEventListener("input", () => {
        syncLabels();
        applyFilters();
      });
    }
    if (clearFiltersLink) {
      clearFiltersLink.addEventListener("click", (e) => {
        e.preventDefault();
        clearAllFilters();
      });
    }
  }
  function injectBrandLogos() {
    const pairs = [
      ["toyota", "Toyota"],
      ["honda", "Honda"],
      ["bmw", "BMW"],
      ["mercedes", "Mercedes"],
      ["audi", "Audi"],
    ];
    pairs.forEach(([id, name]) => {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) {
        const img = document.createElement("img");
        img.className = "brand-logo";
        img.src = getBrandLogo(name);
        img.alt = name;
        label.prepend(img);
      }
    });
  }

  async function loadVehicles() {
    showSkeleton(8);
    try {
      const url = CONFIG?.paths?.vehiclesCsv || "../DATA/vehicles.csv";
      const res = await fetch(url);
      const text = await res.text();
      const rows = parseCSV(text);
      allVehicles = rows.map(normalizeVehicle).filter((v) => v.brand && v.model);
      filteredVehicles = allVehicles.slice();
      updateResultsCount();
      grid.innerHTML = "";
      list.innerHTML = "";
      renderBatch(true);
    } catch (e) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <p>Failed to load vehicles data</p>
        </div>
      `;
    }
  }

  setupViewToggle();
  setupCompareMode();
  setupFilters();
  injectBrandLogos();
  window.addEventListener("scroll", onScrollLoadMore);
  loadVehicles();
});
