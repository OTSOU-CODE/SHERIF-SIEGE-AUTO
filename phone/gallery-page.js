// Gallery Page JavaScript for SHERIF-SIEGE-AUTO Mobile Website

// Gallery data
const galleryData = [
  {
          src: 'component/Gallery/Blue.png',
          title: 'Vibrant Blue Leather Upholstery',
          description: 'Sporty style in deep blue leather. Featuring strong side supports and quality stitching.'
        },
        {
          src: 'component/Gallery/Red.png',
          title: 'Vibrant Red Sport Upholstery',
          description: 'Sporty Upholstery with Vibrant Red Leather. Features ergonomic side bolsters and precision stitching for ultimate comfort and style.'
        },
        {
          src: 'component/Gallery/Black-&-Red.png',
          title: 'Two-Tone Sport Upholstery (Black/Red)',
          description: 'Two-Tone Sport Upholstery in Black & Red Leather. Features ergonomic side bolsters and precision stitching for a high-contrast, modern look.'
        },
        {
          src: 'component/Gallery/Dark-blue-&-white.png',
          title: 'Two-Tone Modern Look (Dark Blue/White)',
          description: 'Elegant Two-Tone Upholstery in Dark Blue & White Leather. Features ergonomic side bolsters and precision stitching for a classic, refined look.'
        },
        {
          src: 'component/Gallery/Black-&-Orange.png',
          title: 'Premium Two-Tone (Black/Orange) Upholstery',
          description: 'Premium Sport Upholstery with Dynamic Orange Inserts. Combines rich black leather with vibrant Orange, engineered with supportive bolsters for comfort.'
        }
];

// Global variables
let galleryItems = [];

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initGallery();
  setupGalleryEvents();
});

// Initialize gallery
function initGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  // Clear existing content
  galleryGrid.innerHTML = '';

  // Add loading state
  galleryGrid.innerHTML = `
    <div class="gallery-loading">
      <i class="fas fa-spinner"></i>
      <span>Loading gallery...</span>
    </div>
  `;

  // Load images with error handling
  loadGalleryImages();
}

// Load gallery images
async function loadGalleryImages() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  try {
    const validImages = [];
    
    for (const item of galleryData) {
      try {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            validImages.push(item);
            resolve();
          };
          img.onerror = () => {
            console.log(`Image not found: ${item.src}`);
            resolve(); // Continue with other images
          };
          img.src = item.src;
        });
      } catch (error) {
        console.log(`Error loading image: ${item.src}`);
      }
    }

    if (validImages.length === 0) {
      showEmptyState();
      return;
    }

    // Clear loading state
    galleryGrid.innerHTML = '';

    // Create gallery items
    validImages.forEach((item, index) => {
      const galleryItem = createGalleryItem(item, index);
      galleryGrid.appendChild(galleryItem);
    });

    // Store gallery items for modal
    galleryItems = validImages;

  } catch (error) {
    console.error('Error loading gallery:', error);
    showEmptyState();
  }
}

// Create gallery item
function createGalleryItem(item, index) {
  const galleryItem = document.createElement('div');
  galleryItem.className = 'gallery-item';
  galleryItem.setAttribute('data-index', index);

  galleryItem.innerHTML = `
    <div class="gallery-image">
      <img src="${item.src}" alt="${item.title}" loading="lazy">
      <div class="gallery-overlay">
        <i class="fas fa-search-plus"></i>
      </div>
    </div>
    <div class="gallery-content">
      <h3 class="gallery-title">${item.title}</h3>
      <p class="gallery-description">${item.description}</p>
    </div>
  `;

  // Add click event - navigate to detail page
  galleryItem.addEventListener('click', () => {
    window.location.href = `image-preview.html?index=${index}`;
  });
  
  // Add touch feedback
  galleryItem.addEventListener('touchstart', function() {
    this.style.transform = 'scale(0.98)';
  });
  
  galleryItem.addEventListener('touchend', function() {
    this.style.transform = '';
  });

  return galleryItem;
}

// Show empty state
function showEmptyState() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = `
    <div class="gallery-empty">
      <i class="fas fa-images"></i>
      <h3>No Images Available</h3>
      <p>We're working on adding more photos to our gallery. Please check back soon!</p>
    </div>
  `;
}

// Setup gallery events
function setupGalleryEvents() {
  // Gallery events are now handled by navigation to detail page
}

