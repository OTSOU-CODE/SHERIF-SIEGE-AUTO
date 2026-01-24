const fs = require('fs');
const path = require('path');

// Configuration
const DATA_PATH = path.join(__dirname, '../JS/vehicles_data.json');
const IMAGES_DIR = path.join(__dirname, '../images/Car images'); // Targeted cleanup

async function cleanupImages() {
    console.log('Starting cleanup...');

    if (!fs.existsSync(DATA_PATH)) {
        console.error('Data file not found!');
        process.exit(1);
    }

    const vehicles = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const usedImages = new Set();

    // Collect all used images
    vehicles.forEach(v => {
        if (v.images) {
            v.images.forEach(img => {
                // img path is like "images/Car images/Brand/..."
                // We need to resolve it to absolute path to compare
                // Assuming script is in /scripts and web root is ../
                const absPath = path.resolve(__dirname, '../', img);
                usedImages.add(absPath.toLowerCase()); // Normalize case for Windows
            });
        }
    });

    console.log(`Found ${usedImages.size} referenced images.`);

    // Walk directory
    let filesToDelete = [];
    let keptCount = 0;

    function walkDir(dir) {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file === 'data.json') continue; // PROTECT the source data file!

            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                walkDir(fullPath);
                // Check if directory is empty after processing children ? 
                // Maybe later.
            } else {
                if (!usedImages.has(fullPath.toLowerCase())) {
                    filesToDelete.push(fullPath);
                } else {
                    keptCount++;
                }
            }
        }
    }

    walkDir(IMAGES_DIR);

    console.log(`Found ${filesToDelete.length} files to delete. Keeping ${keptCount}.`);

    if (process.argv.includes('--delete')) {
        console.log('Deleting files...');
        filesToDelete.forEach(f => {
            try {
                fs.unlinkSync(f);
            } catch (e) {
                console.error(`Failed to delete ${f}: ${e.message}`);
            }
        });
        console.log('Deletion complete.');
        
        // Cleanup empty directories
        console.log('Cleaning empty directories...');
        cleanEmptyDirs(IMAGES_DIR);
    } else {
        console.log('Dry run complete. Use --delete to actually delete files.');
    }
}

function cleanEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    let isEmpty = true;
    
    for (const file of files) {
         if (file === 'data.json') {
             isEmpty = false;
             continue;
         }
         const fullPath = path.join(dir, file);
         const stat = fs.statSync(fullPath);
         if (stat.isDirectory()) {
             if (!cleanEmptyDirs(fullPath)) {
                 isEmpty = false;
             }
         } else {
             isEmpty = false;
         }
    }
    
    if (isEmpty && dir !== IMAGES_DIR) {
        try {
            fs.rmdirSync(dir);
            return true;
        } catch(e) {
            return false;
        }
    }
    return false;
}

cleanupImages();
