// Gallery Page JavaScript for SHERIF-SIEGE-AUTO Mobile Website

// Gallery data
const galleryData = [
  {
    src: "images/gallery/Black-&-Orange.webp",
    title: "Premium Black & Orange",
    description: "Sporty two-tone upholstery with vibrant orange accents.",
  },

  {
    src: "images/gallery/Dark-blue-&-white.webp",
    title: "Modern Dark Blue & White",
    description: "Bold contrast with exceptional craftsmanship.",
  },
  {
    src: "images/gallery/Black-&-Red.webp",
    title: "Sporty Black & Red",
    description: "Dynamic black and red leather combination.",
  },
];

// Global variables
let galleryItems = [];

// Initialize gallery when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initGallery();
  setupGalleryEvents();
  animateStats();
  initBeforeAfterSlider();
});

// Initialize gallery
function initGallery() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (!galleryGrid) return;

  // Clear existing content
  galleryGrid.innerHTML = "";

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
// Load gallery images directly
function loadGalleryImages() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (!galleryGrid) return;

  // Clear loading state
  galleryGrid.innerHTML = "";

  if (galleryData.length === 0) {
    showEmptyState();
    return;
  }

  // Create gallery items directly
  galleryData.forEach((item, index) => {
    const galleryItem = createGalleryItem(item, index);
    galleryGrid.appendChild(galleryItem);
  });

  // Trigger animations
  setTimeout(() => {
    const items = document.querySelectorAll(".gallery-item");
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("visible");
      }, index * 100);
    });
  }, 100);
}

// Create gallery item HTML


function showEmptyState() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (galleryGrid) {
    galleryGrid.innerHTML = '<div class="error-message">No images found.</div>';
  }
}

function setupGalleryEvents() {
  // Any additional events
}

// Stats Animation
function animateStats() {
  const statsSection = document.querySelector(".gallery-stats");
  if (!statsSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const numbers = statsSection.querySelectorAll(".stat-number");
          numbers.forEach((num) => {
            const target = parseInt(num.innerText);
            if (isNaN(target)) return; // Skip if not a number (e.g. "99%")

            let current = 0;
            const suffix = num.innerText.replace(/[0-9]/g, "");
            const duration = 2000; // 2 seconds
            const stepTime = Math.abs(Math.floor(duration / target));

            const timer = setInterval(() => {
              current += 1;
              num.innerText = current + suffix;
              if (current >= target) {
                clearInterval(timer);
                num.innerText = target + suffix; // Ensure exact end value
              }
            }, stepTime);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(statsSection);
}

// Store gallery items for modal

// Create gallery item
function createGalleryItem(item, index) {
  const galleryItem = document.createElement("div");
  galleryItem.className = "gallery-item";
  galleryItem.setAttribute("data-index", index);

  galleryItem.innerHTML = `
    <div class="gallery-image">
      <img src="${item.src}" alt="${item.title}" title="${item.title}" loading="lazy">
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
  galleryItem.addEventListener("click", () => {
    window.location.href = `image-preview.html?index=${index}`;
  });

  // Add touch feedback
  galleryItem.addEventListener("touchstart", function () {
    this.style.transform = "scale(0.98)";
  });

  galleryItem.addEventListener("touchend", function () {
    this.style.transform = "";
  });

  return galleryItem;
}

// Show empty state
function showEmptyState() {
  const galleryGrid = document.getElementById("gallery-grid");
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
// Before/After Slider Logic
function initBeforeAfterSlider() {
  const container = document.getElementById("beforeAfterSlider");
  if (!container) return;

  const handle = container.querySelector(".ba-handle");
  const beforeWrapper = container.querySelector(".ba-image-wrapper.before");
  const beforeImage = beforeWrapper.querySelector("img");
  let isDragging = false;

  // Set initial width
  // Ensure the image inside the clipping container remains full width
  // This is handled by CSS: .ba-image { width: 900px; max-width: none; }
  // We need to ensure the width matches the container width dynamically if responsive.

  function updateSlider(x) {
    const rect = container.getBoundingClientRect();
    let pos = x - rect.left;

    // Constrain
    if (pos < 0) pos = 0;
    if (pos > rect.width) pos = rect.width;

    const percentage = (pos / rect.width) * 100;

    beforeWrapper.style.width = percentage + "%";
    handle.style.left = percentage + "%";
  }

  // Mouse Events
  handle.addEventListener("mousedown", () => (isDragging = true));
  window.addEventListener("mouseup", () => (isDragging = false));
  container.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    updateSlider(e.clientX);
  });

  // Touch Events
  handle.addEventListener("touchstart", () => (isDragging = true));
  window.addEventListener("touchend", () => (isDragging = false));
  container.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    updateSlider(e.touches[0].clientX);
  });

  // Click to jump
  container.addEventListener("click", (e) => {
    updateSlider(e.clientX);
  });

  // Handle Resize to keep aspect ratio or image width correct
  window.addEventListener("resize", () => {
    const rect = container.getBoundingClientRect();
    // If we are using fixed pixel width for image to prevent squishing, we might need to update it.
    // But object-fit: cover is easier if container has fixed aspect ratio.
    // My CSS set .ba-image { width: 900px; } which is rigid.
    // Better: .ba-image { width: [containerWidth]px; }

    const w = rect.width;
    const images = container.querySelectorAll(".ba-image");
    images.forEach((img) => {
      img.style.width = w + "px";
    });
  });

  // Init Resize once
  setTimeout(() => {
    const rect = container.getBoundingClientRect();
    const images = container.querySelectorAll(".ba-image");
    images.forEach((img) => {
      img.style.width = rect.width + "px";
    });
  }, 100);
}
