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
  async function loadVehicles() {
    grid.innerHTML = getSkeletonHTML(4);
    try {
      if (!window.VEHICLE_DATA) {
        throw new Error("Vehicle data script not loaded.");
      }
      
      const data = window.VEHICLE_DATA;

      // Normalize and Shuffle
      allVehicles = data.map(v => {
          return enrichWithMockData(v);
      });

      // Shuffle
      allVehicles.sort(() => Math.random() - 0.5);

      applyFilters();
    } catch (e) {
      console.error("Failed to load data", e);
      grid.innerHTML = `<div class="empty-state">Failed to load vehicle data. <br><small>${e.message}</small></div>`;
    }
  }

  // --- Mock Data Generation & Normalization ---
  function enrichWithMockData(v) {
    // Keep existing mock data logic for consistency
    const idNum = parseInt(v.id.replace(/[^0-9]/g, '')) || 0;
    const seed = idNum;
    const rand = (offset) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "Plug-in"];
    const transmissions = ["Manual", "Automatic"];
    
    let priceMonthly = 0;
    let initialPayment = 0;
    
    if (v.priceRaw > 0) {
        priceMonthly = Math.floor(v.priceRaw / 48);
        initialPayment = Math.floor(v.priceRaw * 0.15);
    } else {
        priceMonthly = Math.floor(rand(1) * 400) + 150;
        initialPayment = Math.floor(priceMonthly * (Math.floor(rand(2) * 6) + 3));
    }

    const specs = v.specs || {};
    const fuel = specs.fuel || v.fuel || fuelTypes[Math.floor(rand(5) * fuelTypes.length)];
    const transmission = specs.transmission || v.transmission || transmissions[Math.floor(rand(6) * transmissions.length)];
    
    let engineSize = specs.engine || v.engineSize || (1.0 + rand(8) * 2.0).toFixed(1);
    if (specs.engine && specs.engine.includes("cc")) {
        const cc = parseInt(specs.engine);
        if (!isNaN(cc)) engineSize = (cc / 1000).toFixed(1);
    }

    const type = specs.bodyType || v.type || "Car";

    // NEW: Construct menu.png image path
    // Structure: images/Car images/{Brand}/{Model}/{Variant}/menu.png
    // Note: We need to be careful with exact folder names.
    // The data has 'variant' which usually matches the folder name
    // Example variant: "Abarth 595 Cabrio 2016 - present, 3 doors, convertible"
    const imagePath = `images/Car images/${v.brand}/${v.model}/${v.variant}/menu.png`;

    return {
      ...v,
      fuel: fuel,
      transmission: transmission,
      engineSize: engineSize,
      type: type,
      seats: specs.seats || v.seats || (Math.floor(rand(7) * 4) + 2),
      doors: specs.doors || v.doors || 5,
      priceMonthly: priceMonthly,
      initialPayment: initialPayment,
      contractLength: [24, 36, 48][Math.floor(rand(3) * 3)],
      mileage: [5000, 8000, 10000, 12000][Math.floor(rand(4) * 4)],
      realImagePath: imagePath
    };
  }

  // --- Rendering ---
  function renderBatch(reset = false) {
    if (reset) {
      grid.innerHTML = "";
      renderIndex = 0;
    }

    const nextBatch = filteredVehicles.slice(
      renderIndex,
      renderIndex + batchSize
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
    // Priority: realImagePath (menu.png) > coverImage > images[0] > placeholder
    let imgUrl = v.realImagePath;
    
    // We'll use onerror in the img tag to fallback if menu.png doesn't exist
    const fallbackUrl = v.coverImage || (v.images && v.images.length > 0 ? v.images[0] : `https://placehold.co/600x450/2c2c2c/D4AF37?text=${v.brand}+${v.model}`);
    
    const brandLogo = getBrandLogo(v.brand);

    return `
        <div class="product-card">
          <div class="card-image-wrapper">
             <span class="badge-count"><i class="fas fa-layer-group"></i> Custom</span>
             <img src="${imgUrl}" class="card-image" alt="${v.model}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackUrl}';">
          </div>

          <div class="card-content">
            <div class="card-header">
                <h3 class="card-title">${v.year} ${v.brand} ${v.model}</h3>
                <p class="card-subtitle">${v.engineSize}L ${v.fuel} • ${v.type}</p>
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
                <a href="image-preview.html?id=${v.id}" class="btn-card-action">
                    <span>View Options</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
          </div>
        </div>
      `;
  }

  function getSkeletonHTML(count) {
    return Array(count)
      .fill(0)
      .map(
        () => `
        <div class="product-card" style="height: 400px; padding:1rem;">
           <div style="height: 180px; background: #f0f0f0; margin-bottom:1rem; border-radius:8px;"></div>
           <div style="height: 20px; width: 60%; background: #f0f0f0; margin-bottom: 10px;"></div>
           <div style="height: 14px; width: 40%; background: #f0f0f0;"></div>
        </div>
      `
      )
      .join("");
  }

  // --- Filters & Logic ---
  function applyFilters() {
    filteredVehicles = allVehicles.filter((v) => {
      if (activeFilters.make.size > 0 && !activeFilters.make.has(v.brand))
        return false;

      if (activeFilters.model.size > 0 && !activeFilters.model.has(v.model))
        return false;

      if (activeFilters.year.size > 0 && !activeFilters.year.has(v.year))
        return false;

      // Other filters removed
      
      return true;
    });

    // Group by Brand + Model + Year
    const uniqueMap = new Map();
    filteredVehicles.forEach(v => {
        const key = `${v.brand}-${v.model}-${v.year}`;
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, v);
        } else {
            // Keep the one with lower price? Or just the first one?
            // Let's keep the one with lower monthly price
            const existing = uniqueMap.get(key);
            if (v.priceMonthly < existing.priceMonthly) {
                uniqueMap.set(key, v);
            }
        }
    });
    
    filteredVehicles = Array.from(uniqueMap.values());

    if (resultsCountEl)
      resultsCountEl.innerText = `${filteredVehicles.length} results`;
    renderBatch(true);
  }

  function setupEventListeners() {
    // Buttons
    // Buttons (Personal/Business) removed

    if (resetFiltersLink) {
      resetFiltersLink.addEventListener('click', (e) => {
        e.preventDefault();
        activeFilters.make.clear();
        activeFilters.model.clear();
        activeFilters.year.clear();
        
        // Reset UI
        document.querySelectorAll('.brand-option.selected').forEach(el => el.classList.remove('selected'));
        if (modelGrid) modelGrid.innerHTML = '<div class="empty-filter-state">Select a Make first</div>';
        // activeFilters.fuel.clear();
        // activeFilters.gearbox.clear();
        // activeFilters.minPrice = 0;
        // activeFilters.maxPrice = 10000;
        applyFilters();
      });
    }

    // Infinite Scroll
    window.addEventListener("scroll", () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        if (renderIndex < filteredVehicles.length) {
          renderBatch(false);
        }
      }
    });

    // Dropdown logic for simple lists (Gearbox, Fuel, etc) REMOVED
    // document.querySelectorAll(".simple-list-options").forEach((list) => { ... });

    // Year Filter Listener
    const yearOptions = document.getElementById("yearOptions");
    if (yearOptions) {
      yearOptions.addEventListener("click", (e) => {
        const btn = e.target.closest(".list-option");
        if (!btn) return;

        const val = btn.dataset.val;
        if (activeFilters.year.has(val)) {
            activeFilters.year.delete(val);
            btn.classList.remove("selected");
        } else {
            activeFilters.year.add(val);
            btn.classList.add("selected");
        }
        applyFilters();
      });
    }

    // View Dropdown Toggling
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".filter-trigger");
      if (trigger) {
        e.stopPropagation();
        const dropdown = trigger.closest(".filter-dropdown");
        // Close others
        document.querySelectorAll(".filter-dropdown").forEach((d) => {
          if (d !== dropdown) d.classList.remove("is-open");
        });
        dropdown.classList.toggle("is-open");
      } else {
        // Close all
        document
          .querySelectorAll(".filter-dropdown")
          .forEach((d) => d.classList.remove("is-open"));
      }
    });
  }



  function injectModels(brand) {
    if (!modelGrid) return;
    
    // Filter models for this brand
    const models = [...new Set(allVehicles.filter(v => v.brand === brand).map(v => v.model))].sort();
    
    if (models.length === 0) {
        modelGrid.innerHTML = '<div class="empty-filter-state">No models found</div>';
        return;
    }

    modelGrid.innerHTML = models.map(m => `
        <div class="brand-option ${activeFilters.model.has(m) ? 'selected' : ''}" 
             onclick="this.dispatchEvent(new CustomEvent('model-select', {detail: '${m}', bubbles: true}))">
            ${m}
        </div>
    `).join("");

    modelGrid.addEventListener("model-select", (e) => {
        const m = e.detail;
        if (activeFilters.model.has(m)) {
            activeFilters.model.delete(m);
            e.target.classList.remove('selected');
        } else {
            // For models, usually single select is better, but multi support is fine
            // Let's stick to valid multi-select for consistency or single?
            // User's provided code was single select logic mostly, but let's allow multi for now or clear others
            // Let's do single select for model to avoid confusion
            activeFilters.model.clear();
            document.querySelectorAll('#modelGrid .brand-option').forEach(el => el.classList.remove('selected'));
            
            activeFilters.model.add(m);
            e.target.classList.add('selected');
        }
        applyFilters();
    });
  }

  function injectBrands() {
    const brands = [...new Set(allVehicles.map((v) => v.brand))].sort();
    if (brandGrid) {
      brandGrid.innerHTML = brands
        .map(
          (b) => `
             <div class="brand-option ${activeFilters.make.has(b) ? 'selected' : ''}" 
                  onclick="this.dispatchEvent(new CustomEvent('brand-select', {detail: '${b}', bubbles: true}))">
                ${b}
             </div>
          `
        )
        .join("");

      brandGrid.addEventListener("brand-select", (e) => {
        const b = e.detail;
        
        // Toggle selection
        if (activeFilters.make.has(b)) {
            activeFilters.make.delete(b);
            e.target.classList.remove('selected');
            // Check if any other brands are selected. If not, clear models.
            if (activeFilters.make.size === 0) {
                 modelGrid.innerHTML = '<div class="empty-filter-state">Select a Make first</div>';
                 activeFilters.model.clear();
            }
        } else {
            // Single select for Brand creates a better flow for defining Models
            activeFilters.make.clear(); 
            document.querySelectorAll('#brandGrid .brand-option').forEach(el => el.classList.remove('selected'));
            
            activeFilters.make.add(b);
            e.target.classList.add('selected');
            
            // Populate models for this brand
            injectModels(b);
            activeFilters.model.clear(); // Reset model selection when brand changes
        }
        applyFilters();
      });
    }
  }

  function injectYears() {
    const yearOptions = document.getElementById("yearOptions");
    if (!yearOptions) return;

    // Extract unique years
    const years = [...new Set(allVehicles.map(v => v.year))].sort().reverse();
    
    yearOptions.innerHTML = years.map(y => `
        <button class="list-option" data-val="${y}">${y}</button>
    `).join("");
  }

  function setupStickyFilterBar() {
    const filterBar = document.getElementById("filterBar");
    if (!filterBar) return;
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) filterBar.classList.add("scrolled");
      else filterBar.classList.remove("scrolled");
    });
  }



  function getBrandLogo(brand) {
    // Basic map or fallback
    const map = {
      Toyota: CONFIG.images.carBrands[0],
      Honda: CONFIG.images.carBrands[1],
      BMW: CONFIG.images.carBrands[2],
      Mercedes: CONFIG.images.carBrands[3],
      Audi: CONFIG.images.carBrands[4],
    };
    return map[brand] || CONFIG.images.carBrands[0];
  }
});
