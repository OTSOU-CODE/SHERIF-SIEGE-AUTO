const CONFIG = {
  images: {
    // Brand Logo Mapping
    brands: {
      "Volkswagen": "images/brands/Sans-titre-1.webp",
      "BMW": "images/brands/Sans-titre-2.webp",
      "Honda": "images/brands/Sans-titre-3.webp",
      "Ford": "images/brands/Sans-titre-4.webp",
      "Toyota": "images/brands/Sans-titre-5.webp",
      "Jeep": "images/brands/Sans-titre-6.webp",
      "Mazda": "images/brands/Sans-titre-7.webp",
      "Nissan": "images/brands/Sans-titre-8.webp",
      "Peugeot": "images/brands/Sans-titre-9.webp",
      "Dacia": "images/brands/Sans-titre-10.webp",
      "Mitsubishi": "images/brands/Sans-titre-11.webp",
      "Audi": "images/brands/Sans-titre-12.webp",
      "Porsche": "images/brands/Sans-titre-13.webp",
      "Mercedes-Benz": "images/brands/Sans-titre-14.webp",
      "Mercedes": "images/brands/Sans-titre-14.webp" // Alias
    }
  },
  paths: {
    vehiclesCsv: "DATA/vehicles.csv",
  },
};

// Ensure CONFIG is available globally
window.CONFIG = CONFIG;
