const fs = require("fs");
const path = require("path");

// Configuration
const IMAGES_DATA_PATH = path.join(__dirname, "../images/Car images/data.json");
const OUTPUT_PATH = path.join(__dirname, "../JS/vehicles_data.js");
const WEB_ROOT_IMAGE_PATH_PREFIX = "images/Car images/"; // Path relative to HTML

async function mergeData() {
  console.log("Reading data...");

  if (!fs.existsSync(IMAGES_DATA_PATH)) {
    console.error(`Error: Data file not found at ${IMAGES_DATA_PATH}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(IMAGES_DATA_PATH, "utf-8"));
  let vehicles = [];
  let idCounter = 0;

  console.log("Processing brands...");

  // Iterate through Brands
  for (const [brand, models] of Object.entries(rawData)) {
    // Iterate through Models
    for (const [modelName, versions] of Object.entries(models)) {
      // versions is an array of cars
      if (!Array.isArray(versions)) continue;

      versions.forEach((carEntry) => {
        // carEntry has "name" and "versions" array (specs) and "images" array
        // We want to flatten this.
        // However, the structure seems to be:
        // "Abarth 595 Cabrio": [ { "name": "...", "versions": [...], "images": [...] } ]

        // Let's take the first spec version as the "main" one for simplicity,
        // or create multiple entries if they are significantly different.
        // For a category page, usually one entry per "Visual Model" is enough.

        const specs =
          carEntry.versions && carEntry.versions.length > 0
            ? carEntry.versions[0]
            : {};
        const images = carEntry.images || [];

        if (images.length === 0) return; // Skip if no images

        // Normalize Images
        // Input: "downloads\\images\\Abarth\\...\\image.jpg"
        // Output: "images/Car images/Abarth/.../image.jpg"
        const validImages = images.map((img) => {
          // Replace backslashes
          let cleanPath = img.replace(/\\/g, "/");
          // Remove "downloads/images/" prefix to match our folder structure
          cleanPath = cleanPath.replace(
            "downloads/images/",
            WEB_ROOT_IMAGE_PATH_PREFIX
          );
          return cleanPath;
        });

        // Extract Year
        let year = "2024";
        const nameYearMatch = carEntry.name.match(/(\d{4})/);
        if (nameYearMatch) year = nameYearMatch[1];

        // Extract Prices
        let price = specs["Price"] || "Contact Us";
        let priceRaw = 0;
        if (price !== "Contact Us") {
          priceRaw = parseFloat(
            price.replace(/[^0-9,]/g, "").replace(",", ".")
          );
        }

        // Extract Specs
        const power = specs["Power"] || "";
        const transmission = specs["Transmission"] || "";
        const fuel = specs["Fuel Type"] || "";
        const seats = "2"; // Default, try to infer?
        // data.json doesn't clearly have seats usually, but maybe in body type "3-doors, convertible"

        const vehicle = {
          id: `car-${idCounter++}`,
          brand: brand,
          model: modelName,
          variant: carEntry.name,
          year: parseInt(year),
          price: price,
          priceRaw: priceRaw,
          specs: {
            power: power,
            transmission: transmission,
            fuel: fuel,
            bodyType: specs["Body Type"] || "",
            engine: specs["Engine Capacity"] || "",
            acceleration: specs["Acceleration 0-100 Km / H"] || "",
          },
          images: validImages,
          coverImage: validImages[0],
        };

        vehicles.push(vehicle);
      });
    }
  }

    console.log(`Processed ${vehicles.length} vehicles from Images.`);
    
    // Process CSVs
    vehicles = await processCSVFiles(vehicles);

    console.log(`Total vehicles: ${vehicles.length}`);

    // Write to file (window.VEHICLE_DATA assignment for local file compatibility)
    const jsContent = `window.VEHICLE_DATA = ${JSON.stringify(vehicles, null, 2)};`;
    
    fs.writeFileSync(OUTPUT_PATH, jsContent, 'utf-8');
    console.log(`Successfully wrote data to ${OUTPUT_PATH}`);
}

async function processCSVFiles(existingVehicles) {
    const dataDir = path.join(__dirname, '../DATA');
    if (!fs.existsSync(dataDir)) return existingVehicles;

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    let newCount = 0;
    
    // Create a set of existing IDs (URLs) to avoid duplicates
    // current ID is car-0, car-1 etc. 
    // The "variant" field might be unique enough or we check "Brand + Model + Year"
    const existingSignatures = new Set(existingVehicles.map(v => `${v.brand}|${v.model}|${v.year}`.toLowerCase()));
    let idCounter = existingVehicles.length;

    for (const file of files) {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
        const rows = parseComplexCSV(content, file);
        
        rows.forEach(row => {
             // Normalize
             const normalized = normalizeCSVVehicle(row, idCounter);
             const sig = `${normalized.brand}|${normalized.model}|${normalized.year}`.toLowerCase();
             
             if (!existingSignatures.has(sig)) {
                 existingVehicles.push(normalized);
                 existingSignatures.add(sig);
                 idCounter++;
                 newCount++;
             }
        });
    }
    console.log(`Added ${newCount} vehicles from CSVs.`);
    return existingVehicles;
}

function parseComplexCSV(text, filename) {
    // Similar logic to what was in category.js
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length < 2) return [];

    const headers = splitCSVLine(lines[0]);
    const vehicleMap = new Map();

    for (let i = 1; i < lines.length; i++) {
        const row = splitCSVLine(lines[i]);
        if (row.length < 5) continue;
        
        // URL is usually reliable as key
        // But headers might vary. Let's look for "URL" index.
        const urlIndex = headers.findIndex(h => h.includes('URL'));
        const url = urlIndex !== -1 ? row[urlIndex] : `manual-${filename}-${i}`;

        if (!vehicleMap.has(url)) vehicleMap.set(url, {});
        const obj = vehicleMap.get(url);

        headers.forEach((h, idx) => {
             const val = row[idx] ? row[idx].trim() : "";
             const key = h.replace(/:$/, "").trim();
             if (val && (!obj[key] || obj[key].length < val.length)) {
                 obj[key] = val;
             }
        });
    }
    return Array.from(vehicleMap.values());
}

function splitCSVLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) {
            values.push(current);
            current = "";
        } else current += char;
    }
    values.push(current);
    return values.map(v => v.replace(/^"|"$/g, "").trim());
}

function normalizeCSVVehicle(v, id) {
    // Extract Year
    let year = "2024";
    const gen = v["Generation"] || v["Model"] || "";
    const match = gen.match(/(\d{4})/);
    if (match) year = match[1];

    // Clean Brand/Model
    let brand = v["Brand"] || "Unknown";
    let model = v["Model"] || "Vehicle";
    if (model.startsWith(brand)) model = model.substring(brand.length).trim();
    
    // Specs
    let price = v["Price"] || "Contact Us";
    let priceRaw = 0;
    if (price !== "Contact Us") {
         priceRaw = parseFloat(price.replace(/[^0-9,]/g, '').replace(',', '.'));
    }

    return {
        id: `csv-${id}`,
        brand: brand,
        model: model,
        variant: v["Generation"] || model,
        year: parseInt(year),
        price: price,
        priceRaw: priceRaw,
        specs: {
            power: v["Power"] || "",
            transmission: v["Gearbox"] || "",
            fuel: v["Fuel"] || "",
            bodyType: v["Body style"] || "",
            engine: v["Displacement"] || "",
            acceleration: v["Acceleration 0-100 km/h"] || ""
        },
        images: [], // No images for CSV entries
        coverImage: null
    };
}

mergeData();
