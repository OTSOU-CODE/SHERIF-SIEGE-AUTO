const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const directories = [
  "component/Gallery",
  "component/Image Variaant",
  "component/Car Brands",
];

async function convertImages() {
  for (const dir of directories) {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) {
      console.log(`Directory not found: ${fullDir}`);
      continue;
    }

    const files = fs.readdirSync(fullDir);
    for (const file of files) {
      if (
        file.toLowerCase().endsWith(".png") ||
        file.toLowerCase().endsWith(".jpg") ||
        file.toLowerCase().endsWith(".jpeg")
      ) {
        const inputPath = path.join(fullDir, file);
        const outputPath = path.join(fullDir, path.parse(file).name + ".webp");

        try {
          await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
          console.log(`Converted: ${file} -> ${path.parse(file).name}.webp`);
        } catch (err) {
          console.error(`Error converting ${file}:`, err);
        }
      }
    }
  }
}

convertImages();
