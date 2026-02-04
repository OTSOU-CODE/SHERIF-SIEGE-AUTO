document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const grid = document.getElementById("vehicleGrid");
  const paginationEl = document.getElementById("pagination");
  const resultsCountEl = document.getElementById("resultsCount");

  // Filter Inputs
  const brandGrid = document.getElementById("brandGrid");
  const modelGrid = document.getElementById("modelGrid");
  const typeOptions = document.getElementById("typeOptions");

  // New Toggles
  const btnPersonal = document.getElementById("btnPersonal");
  const btnBusiness = document.getElementById("btnBusiness");
  const resetFiltersLink = document.getElementById("resetFiltersLink");

  // --- State ---
  let allVehicles = [];
  let filteredVehicles = [];
  let activeFilters = {
    make: new Set(),
    model: new Set(),
    year: new Set(),
    // type: new Set(), // Removed
    // minPrice: 0, // Removed
    // maxPrice: 10000, // Removed
    // fuel: new Set(), // Removed
    // gearbox: new Set(), // Removed
    // leasingType: "Personal", // Removed
  };
  let renderIndex = 0;
  const batchSize = 12;
  let currentView = "grid";

  // --- Initialization ---
  async function init() {
    setupEventListeners();
    await loadVehicles();
    injectBrands();
    injectYears();
    // setupParallaxHero(); // Simplified for now
    setupStickyFilterBar();
  }

  // --- Data Loading ---
  // --- Data Loading ---
  // --- Data Loading ---
  async function loadVehicles() {
    grid.innerHTML = getSkeletonHTML(4);
    try {
      let dataRows = [];
      let isLocal = false;

      // Check for local data first (Fix for CORS on file://)
      if (window.VEHICLE_DATA && Array.isArray(window.VEHICLE_DATA)) {
          console.log("Using local VEHICLE_DATA");
          dataRows = window.VEHICLE_DATA;
          isLocal = true;
      } else {
          // Fallback to Fetch
          const csvPath = (window.CONFIG && window.CONFIG.paths && window.CONFIG.paths.vehiclesCsv) ? window.CONFIG.paths.vehiclesCsv : "DATA/vehicles.csv";
          const response = await fetch(csvPath);
          if (!response.ok) throw new Error("Failed to load vehicle data");

          const text = await response.text();
          const lines = text.split("\n").filter((l) => l.trim());
          dataRows = lines[0].toLowerCase().includes("brand") ? lines.slice(1) : lines;
      }

      allVehicles = dataRows
        .map((item, index) => {
          let brand, model, year;

          if (isLocal) {
              brand = item.brand;
              model = item.model;
              year = item.year;
          } else {
              // CSV Line parsing
              const cols = item.split(",");
              if (cols.length < 2) return null;
              brand = cols[0].trim();
              model = cols[1].trim();
              year = cols[2] ? cols[2].trim() : "2020";
          }

          return {
            id: isLocal ? `local-${index}` : `csv-${index}`,
            brand: brand,
            model: model,
            year: year,
            priceMonthly: 0,
            engineSize: "2.0",
            fuel: "Petrol",
            type: "Sedan",
            transmission: "Automatic",
            seats: 5,
            doors: 4,
            realImagePath: "", 
            coverImage: "", 
            images: [],
          };
        })
        .filter((v) => v !== null);

      // Shuffle
      allVehicles.sort(() => Math.random() - 0.5);

      applyFilters();
    } catch (e) {
      console.error("Failed to load data", e);
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
            <h3>Unable to load vehicles</h3>
            <p>Please try refreshing the page.</p>
            <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">Error: ${e.message}</p>
        </div>`;
    }
  }

  // --- Rendering ---
  function renderBatch(reset = false) {
    if (reset) {
      grid.innerHTML = "";
      renderIndex = 0;
    }

    const nextBatch = filteredVehicles.slice(
      renderIndex,
      renderIndex + batchSize,
    );

    if (nextBatch.length === 0 && reset) {
      grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem;">
            <i class="fas fa-search" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
            <h3>No results found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        `;
      return;
    }

    const html = nextBatch.map(createGridCard).join("");
    grid.insertAdjacentHTML("beforeend", html);
    renderIndex += nextBatch.length;

    if (paginationEl) {
      paginationEl.style.display =
        renderIndex >= filteredVehicles.length ? "none" : "flex";
    }
  }

  function createGridCard(v) {
    // Robust Fallback Image
    // Uses a stylish placeholder or random existing image if we had logic for it.
    // For now, consistent placeholders are better than 404s.
    const fallbackUrl = `https://placehold.co/600x450/2c2c2c/D4AF37?text=${encodeURIComponent(v.brand + '\\n' + v.model)}`;
    let imgUrl = v.realImagePath || fallbackUrl;

    return `
        <div class="product-card">
          <div class="card-image-wrapper">
             <span class="badge-count"><i class="fas fa-layer-group"></i> Custom</span>
             <img src="${imgUrl}" class="card-image" alt="${v.model}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
          </div>

          <div class="card-content">
            <div class="card-header">
                <div class="brand-badge">
                   <!-- Logo is injected here -->
                   <img src="${getBrandLogo(v.brand)}" alt="${v.brand}" style="width: 24px; height: 24px; object-fit: contain;">
                </div>
                <div>
                   <h3 class="card-title">${v.year} ${v.brand} ${v.model}</h3>
                   <p class="card-subtitle">${v.engineSize}L ${v.fuel} • ${v.type}</p>
                </div>
            </div>

            <div class="specs-grid">
                <div class="spec-item" title="Fuel Type">
                    <i class="fas fa-gas-pump"></i> ${v.fuel}
                </div>
                <div class="spec-item" title="Transmission">
                    <i class="fas fa-cog"></i> ${v.transmission}
                </div>
                <div class="spec-item" title="Seats">
                    <i class="fas fa-chair"></i> ${v.seats} Seats
                </div>
                <div class="spec-item" title="Doors">
                    <i class="fas fa-door-open"></i> ${v.doors} Doors
                </div>
            </div>

            <div class="card-actions">
                <div class="price-info">
                    <span class="price-label">Customization from</span>
                    <span class="price-value">Contact Us</span>
                </div>
                <a href="#" class="btn-card-action">
                    <span>View Options</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
          </div>
        </div>
      `;
  }

  // ... (getSkeletonHTML remains same) ...

  // ... (applyFilters remains same) ...

  // ... (setupEventListeners remains same) ...

  function getBrandLogo(brand) {
    // Use CONFIG.images.brands
    if (window.CONFIG && window.CONFIG.images && window.CONFIG.images.brands) {
        return window.CONFIG.images.brands[brand] || window.CONFIG.images.brands['Volkswagen']; // Fallback
    }
    return "images/brands/Sans-titre-1.webp"; // Hard Fallback
  }
  // --- Security ---
  function escapeHTML(str) {
    if (!str) return "";
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag],
    );
  }

  init();
});
