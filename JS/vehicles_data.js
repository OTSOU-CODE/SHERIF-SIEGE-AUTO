// Embedded Vehicle Data to avoid CORS issues with local file execution
const VEHICLE_DATA = [
  { brand: "Abarth", model: "595", year: "2016" },
  { brand: "Abarth", model: "124 Spider", year: "2016" },
  { brand: "Alfa Romeo", model: "Giulia", year: "2020" },
  { brand: "Alfa Romeo", model: "Stelvio", year: "2020" },
  { brand: "Audi", model: "A3", year: "2021" },
  { brand: "Audi", model: "A4", year: "2020" },
  { brand: "BMW", model: "3 Series", year: "2021" },
  { brand: "BMW", model: "5 Series", year: "2020" },
  { brand: "Mercedes-Benz", model: "C-Class", year: "2021" },
  { brand: "Mercedes-Benz", model: "E-Class", year: "2020" },
  { brand: "Volkswagen", model: "Golf", year: "2020" },
  { brand: "Volkswagen", model: "Passat", year: "2019" },
  { brand: "Volvo", model: "XC60", year: "2021" },
  { brand: "Volvo", model: "XC90", year: "2020" }
];

// Expose globally
window.VEHICLE_DATA = VEHICLE_DATA;
console.log("Vehicle Data Loaded:", VEHICLE_DATA.length, "items");
