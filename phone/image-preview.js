// Renamed from image-detail.js
// Image Preview Page JavaScript for SHERIF-SIEGE-AUTO Mobile Website

// Copy of image-detail.js to maintain functionality after rename

// Gallery data (shared with gallery-page.js)
const galleryData = [
  {
    src: 'https://i.imgur.com/g27w1H7.jpeg',
    title: 'Vibrant Blue Leather Upholstery',
    description: 'Sporty style in deep blue leather. Featuring strong side supports and quality stitching.',
    variants: [
      { src: 'https://i.imgur.com/g27w1H7.jpeg', title: 'Blue with Black Accents' },
      { src: 'https://i.imgur.com/sA1y4wG.jpeg', title: 'Blue with Red Accents' },
      { src: 'https://i.imgur.com/4JjE9tM.jpeg', title: 'Blue with Sport Stitching' }
    ]
  },
  {
    src: 'https://i.imgur.com/sA1y4wG.jpeg',
    title: 'Vibrant Red Sport Upholstery',
    description: 'Sporty Upholstery with Vibrant Red Leather. Features ergonomic side bolsters and precision stitching for ultimate comfort and style.',
    variants: [
      { src: 'https://i.imgur.com/sA1y4wG.jpeg', title: 'Solid Red' },
      { src: 'https://i.imgur.com/4JjE9tM.jpeg', title: 'Red with Black Accents' },
      { src: 'https://i.imgur.com/jE6XhT7.jpeg', title: 'Red with Orange Details' }
    ]
  },
  {
    src: 'https://i.imgur.com/4JjE9tM.jpeg',
    title: 'Two-Tone Sport Upholstery (Black/Red)',
    description: 'Two-Tone Sport Upholstery in Black & Red Leather. Features ergonomic side bolsters and precision stitching for a high-contrast, modern look.',
    variants: [
      { src: 'https://i.imgur.com/g27w1H7.jpeg', title: 'Right Side View' },
      { src: 'https://i.imgur.com/sA1y4wG.jpeg', title: 'Left Side View' },
      { src: 'https://i.imgur.com/4JjE9tM.jpeg', title: 'Right Side Car View' },
      { src: 'https://i.imgur.com/QZbfNnF.jpeg', title: 'Left Side Back View' }
    ]
  },
  {
    src: 'https://i.imgur.com/QZbfNnF.jpeg',
    title: 'Two-Tone Modern Look (Dark Blue/White)',
    description: 'Elegant Two-Tone Upholstery in Dark Blue & White Leather. Features ergonomic side bolsters and precision stitching for a classic, refined look.',
    variants: [
      { src: 'https://i.imgur.com/jE6XhT7.jpeg', title: 'Right Side View' },
      { src: 'https://i.imgur.com/g27w1H7.jpeg', title: 'Left Side View' },
      { src: 'https://i.imgur.com/sA1y4wG.jpeg', title: 'Right Side Car View' },
      { src: 'https://i.imgur.com/4JjE9tM.jpeg', title: 'Left Side Back View' }
    ]
  },
  {
    src: 'https://i.imgur.com/jE6XhT7.jpeg',
    title: 'Premium Two-Tone (Black/Orange) Upholstery',
    description: 'Premium Sport Upholstery with Dynamic Orange Inserts. Combines rich black leather with vibrant Orange, engineered with supportive bolsters for comfort.',
    variants: [
      { src: 'https://i.imgur.com/QZbfNnF.jpeg', title: 'Right Side View' },
      { src: 'https://i.imgur.com/jE6XhT7.jpeg', title: 'Left Side View' },
      { src: 'https://i.imgur.com/g27w1H7.jpeg', title: 'Right Side Car View' },
      { src: 'https://i.imgur.com/sA1y4wG.jpeg', title: 'Left Side Back View' }
    ]
  }
];

// Global variables
let currentImage = null;
let currentVariantIndex = 0;
let dotsContainerDetail = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initImageDetail();
  setupContactForm();
});

// Safely derive a human-friendly image title
function deriveImageTitle(providedTitle, src) {
  if (providedTitle && providedTitle.trim()) return providedTitle;
  if (!src) return 'Image';
  try {
    const file = src.split('/').pop() || src;
    const name = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch (_) {
    return 'Image';
  }
}

// Initialize image detail page
function initImageDetail() {
  // Get image index from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const imageIndex = parseInt(urlParams.get('index')) || 0;

  // Validate index
  if (imageIndex < 0 || imageIndex >= galleryData.length) {
    showEmptyState();
    return;
  }

  currentImage = galleryData[imageIndex];
  displayImageDetail(currentImage);

  // Add error handling for main image
  setTimeout(() => {
    const mainImg = document.getElementById('main-image');
    if (mainImg) {
      mainImg.onerror = function () {
        console.log(`Main image failed to load: ${currentImage.src}`);
        showEmptyState();
      };
      // Make main image clickable to enlarge
      mainImg.style.cursor = 'pointer';
      mainImg.addEventListener('click', function () {
        openImageModal(this.src, currentImage.title);
      });
    }
  }, 100);

  // Initialize variant selection
  setupVariants();

  // Build carousel dots under the main image
  buildDetailDots();

  // Enable swipe/drag navigation between variants
  setupDetailSwipe();
}

// Display image detail
function displayImageDetail(image) {
  const container = document.getElementById('detail-container');
  if (!container) return;

  const safeTitle = deriveImageTitle(image.title, image.src);

  container.innerHTML = `
    <div class="detail-top">
      <h1 class="detail-title">${safeTitle}</h1>
    </div>
    
    <div class="detail-main">
      <div class="detail-left">
        <div class="detail-variants">
          <h3 class="variants-header">Available Variants</h3>
          <div class="variant-list" id="variant-list">
            ${createVariantsList(image.variants)}
          </div>
        </div>
      </div>
      
      <div class="detail-center">
        <div class="detail-image-container">
          <img src="${image.src}" alt="${safeTitle}" title="${safeTitle}" id="main-image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; opacity: 1; visibility: visible;">
        </div>
        <div class="carousel-dots" id="detail-dots" role="tablist" aria-label="Variant Navigation"></div>
        <div class="detail-description-container">
          <p class="detail-description">${image.description}</p>
          <div class="detail-features">
            <span class="feature-tag">Premium Leather</span>
            <span class="feature-tag">Custom Stitching</span>
            <span class="feature-tag">Ergonomic Design</span>
          </div>
        </div>
      </div>
      
      <div class="detail-right">
        <div class="detail-info-container">
          <h1 class="detail-title desktop-title">${safeTitle}</h1>
          <p class="detail-description desktop-description">${image.description}</p>
          <div class="detail-features desktop-features">
            <span class="feature-tag">Premium Leather</span>
            <span class="feature-tag">Custom Stitching</span>
            <span class="feature-tag">Ergonomic Design</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Create variants list HTML
function createVariantsList(variants) {
  return variants.map((variant, index) => `
    <div class="variant-item ${index === 0 ? 'active' : ''}" data-index="${index}">
      <div class="variant-thumbnail">
        <img src="${variant.src}" alt="${variant.title}">
      </div>
      <div class="variant-title">${variant.title}</div>
    </div>
  `).join('');
}

// Setup variant selection
function setupVariants() {
  const variantItems = document.querySelectorAll('.variant-item');

  variantItems.forEach((item, index) => {
    item.addEventListener('click', function () {
      setVariantIndex(index);
    });

    // Add touch feedback
    item.addEventListener('touchstart', function () {
      this.style.transform = 'scale(0.98)';
    });

    item.addEventListener('touchend', function () {
      this.style.transform = '';
    });

    // Add error handling for variant thumbnails
    const thumbnailImg = item.querySelector('.variant-thumbnail img');
    if (thumbnailImg && currentImage) {
      thumbnailImg.onerror = function () {
        console.log(`Variant thumbnail failed to load: ${this.src}, using main image`);
        this.src = currentImage.src;
      };
      // Ensure title attribute for tooltip
      const v = currentImage.variants[index];
      thumbnailImg.title = deriveImageTitle(v && v.title, v && v.src);
      // Make variant thumbnails clickable to enlarge
      thumbnailImg.style.cursor = 'pointer';
      thumbnailImg.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent triggering variant selection
        const variant = currentImage.variants[index];
        if (variant) {
          openImageModal(variant.src, deriveImageTitle(variant.title, variant.src));
        }
      });
    }
  });
}

// Build dots for variants
function buildDetailDots() {
  dotsContainerDetail = document.getElementById('detail-dots');
  if (!dotsContainerDetail || !currentImage) return;

  dotsContainerDetail.innerHTML = '';
  (currentImage.variants || [currentImage]).forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (index === currentVariantIndex ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to variant ${index + 1}`);
    dot.setAttribute('aria-selected', index === currentVariantIndex ? 'true' : 'false');
    dot.addEventListener('click', () => setVariantIndex(index));
    dotsContainerDetail.appendChild(dot);
  });
}

function updateDetailDots() {
  if (!dotsContainerDetail) dotsContainerDetail = document.getElementById('detail-dots');
  if (!dotsContainerDetail) return;
  const dots = dotsContainerDetail.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    if (index === currentVariantIndex) {
      dot.classList.add('active');
      dot.setAttribute('aria-selected', 'true');
    } else {
      dot.classList.remove('active');
      dot.setAttribute('aria-selected', 'false');
    }
  });
}

// Set variant and smoothly swap image
function setVariantIndex(index) {
  if (!currentImage || !currentImage.variants || !currentImage.variants[index]) return;
  currentVariantIndex = index;

  // Update active state in list
  const variantItems = document.querySelectorAll('.variant-item');
  variantItems.forEach((i, idx) => i.classList.toggle('active', idx === index));

  const variant = currentImage.variants[index];
  const container = document.querySelector('.detail-image-container');
  const currentImg = document.getElementById('main-image');
  if (!container || !currentImg) return;

  // Remove any existing transition images that are not the main one
  const allImages = container.querySelectorAll('img');
  allImages.forEach(img => {
    if (img.id !== 'main-image' && img !== currentImg) {
      img.remove();
    }
  });

  // Create next image for crossfade
  const nextImg = document.createElement('img');
  nextImg.src = variant.src;
  nextImg.alt = deriveImageTitle(variant.title, variant.src);
  nextImg.title = deriveImageTitle(variant.title, variant.src);
  nextImg.style.position = 'absolute';
  nextImg.style.left = '0';
  nextImg.style.top = '0';
  nextImg.style.width = '100%';
  nextImg.style.height = '100%';
  nextImg.style.objectFit = 'cover';
  nextImg.style.opacity = '0';
  nextImg.style.transform = 'scale(1.02)';
  nextImg.style.transition = 'opacity 800ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 900ms cubic-bezier(0.22, 0.61, 0.36, 1)';
  nextImg.style.zIndex = '2';
  nextImg.style.visibility = 'visible';

  // Add error handling - fallback to main image if variant fails
  nextImg.onerror = function () {
    console.log(`Variant image failed to load: ${variant.src}, using main image`);
    if (currentImage && currentImage.src) {
      this.src = currentImage.src;
    }
  };

  // Ensure current image is positioned and visible initially
  currentImg.style.position = 'absolute';
  currentImg.style.left = '0';
  currentImg.style.top = '0';
  currentImg.style.width = '100%';
  currentImg.style.height = '100%';
  currentImg.style.zIndex = '1';
  currentImg.style.opacity = '1';
  currentImg.style.visibility = 'visible';

  container.appendChild(nextImg);

  // Trigger transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nextImg.style.opacity = '1';
      nextImg.style.transform = 'scale(1)';
      currentImg.style.opacity = '0';
      currentImg.style.visibility = 'hidden';
    });
  });

  // After transition, remove old and set id on new
  const removeOldImage = () => {
    if (currentImg && currentImg.parentNode && currentImg.id === 'main-image') {
      currentImg.remove();
    }
    nextImg.id = 'main-image';
    nextImg.style.zIndex = '1';
    // Make the new main image clickable
    nextImg.style.cursor = 'pointer';
    nextImg.onclick = function () {
      openImageModal(this.src, deriveImageTitle(variant.title || currentImage.title, this.src));
    };
  };

  nextImg.addEventListener('transitionend', removeOldImage, { once: true });

  // Fallback: remove old image after transition time
  setTimeout(() => {
    if (currentImg && currentImg.parentNode && currentImg.id === 'main-image') {
      currentImg.style.opacity = '0';
      currentImg.style.visibility = 'hidden';
      setTimeout(() => {
        if (currentImg.parentNode) {
          currentImg.remove();
        }
      }, 100);
    }
    // Ensure nextImg is set up as main image with click handler
    if (nextImg && nextImg.parentNode) {
      nextImg.id = 'main-image';
      nextImg.style.zIndex = '1';
      nextImg.style.cursor = 'pointer';
      nextImg.onclick = function () {
        openImageModal(this.src, deriveImageTitle(variant.title || currentImage.title, this.src));
      };
    }
  }, 900);

  updateDetailDots();
}

// Swipe/drag to navigate variants (left = next, right = previous)
function setupDetailSwipe() {
  const container = document.querySelector('.detail-image-container');
  if (!container || !currentImage) return;

  const total = (currentImage.variants && currentImage.variants.length) || 0;
  if (total === 0) return;

  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isHorizontal = false;
  let hasMoved = false;

  // Add click handler to container for opening modal
  container.addEventListener('click', function (e) {
    // Only open modal if no swipe/drag occurred
    if (!hasMoved && !isDragging) {
      const mainImg = document.getElementById('main-image');
      if (mainImg) {
        openImageModal(mainImg.src, currentImage.title);
      }
    }
  });

  // Touch events
  container.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
    isHorizontal = false;
    hasMoved = false;
  }, { passive: true });

  container.addEventListener('touchmove', function (e) {
    if (!startX || !startY) return;
    const diffX = startX - e.touches[0].clientX;
    const diffY = startY - e.touches[0].clientY;

    if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
      hasMoved = true;
    }

    if (!isHorizontal && Math.abs(diffX) > 10) {
      isHorizontal = Math.abs(diffX) > Math.abs(diffY);
    }

    if (isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
      isDragging = true;
    }
  }, { passive: false });

  container.addEventListener('touchend', function (e) {
    if (!isDragging || !startX) {
      startX = 0; startY = 0; isDragging = false; isHorizontal = false; hasMoved = false; return;
    }
    const diffX = startX - e.changedTouches[0].clientX;
    const threshold = 50;
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // left -> next
        setVariantIndex((currentVariantIndex + 1) % total);
      } else {
        // right -> prev
        setVariantIndex((currentVariantIndex - 1 + total) % total);
      }
    }
    startX = 0; startY = 0; isDragging = false; isHorizontal = false; hasMoved = false;
  }, { passive: true });

  // Mouse drag for desktop
  let mouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  container.addEventListener('mousedown', function (e) {
    e.preventDefault(); // prevent default image drag ghost
    mouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isDragging = false;
    isHorizontal = false;
    hasMoved = false;
  });

  container.addEventListener('mousemove', function (e) {
    if (!mouseDown) return;
    const diffX = mouseStartX - e.clientX;
    const diffY = mouseStartY - e.clientY;
    if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
      hasMoved = true;
    }
    if (!isHorizontal && Math.abs(diffX) > 10) {
      isHorizontal = Math.abs(diffX) > Math.abs(diffY);
    }
    if (isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
      isDragging = true;
    }
  });

  container.addEventListener('mouseup', function (e) {
    if (!mouseDown || !isDragging) {
      mouseDown = false; isDragging = false; isHorizontal = false; hasMoved = false; return;
    }
    const diffX = mouseStartX - e.clientX;
    const threshold = 50;
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        setVariantIndex((currentVariantIndex + 1) % total);
      } else {
        setVariantIndex((currentVariantIndex - 1 + total) % total);
      }
    }
    mouseDown = false; isDragging = false; isHorizontal = false; hasMoved = false;
  });

  container.addEventListener('mouseleave', function () {
    mouseDown = false; isDragging = false; isHorizontal = false; hasMoved = false;
  });

  // Prevent native dragstart on images inside
  container.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });
}

// Show empty state
function showEmptyState() {
  const container = document.getElementById('detail-container');
  if (!container) return;

  container.innerHTML = `
    <div class="detail-empty">
      <i class="fas fa-image"></i>
      <h3>Image Not Found</h3>
      <p>The image you're looking for doesn't exist. Please return to the gallery to browse our work.</p>
      <a href="gallery.html" class="btn btn-primary" style="margin-top: var(--spacing-lg); display: inline-block;">
        <span>Back to Gallery</span>
      </a>
    </div>
  `;
}

// Setup contact form
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      vehicle: formData.get('vehicle'),
      message: formData.get('message')
    };

    // Add image information to message
    if (currentImage) {
      data.message = `Interested in: ${currentImage.title}\n\n${data.message}`;
    }

    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
      `Hi! I'm interested in your upholstery services.\n\n` +
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `${data.phone ? `Phone: ${data.phone}\n` : ''}` +
      `${data.vehicle ? `Vehicle: ${data.vehicle}\n` : ''}\n` +
      `Message: ${data.message}`
    );

    // Open WhatsApp
    window.open(`https://wa.me/212715637340?text=${whatsappMessage}`, '_blank');

    // Show success message
    showFormSuccess();

    // Reset form
    contactForm.reset();
  });
}

// Show form success message
function showFormSuccess() {
  const formContainer = document.querySelector('.contact-form-container');
  if (!formContainer) return;

  const successMsg = document.createElement('div');
  successMsg.className = 'form-success';
  successMsg.style.cssText = `
    background: var(--success);
    color: white;
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    text-align: center;
    margin-bottom: var(--spacing-lg);
    animation: slideDown 0.3s ease;
  `;
  successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Message sent! We\'ll get back to you soon.';

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  formContainer.insertBefore(successMsg, formContainer.firstChild);

  // Remove success message after 5 seconds
  setTimeout(() => { successMsg.remove(); style.remove(); }, 5000);
}

// Scroll to contact form function
function scrollToContact() {
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Make scrollToContact available globally
window.scrollToContact = scrollToContact;

// Image Modal/Lightbox functionality
function openImageModal(imageSrc, imageTitle) {
  const safeTitle = deriveImageTitle(imageTitle, imageSrc);
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    position: relative;
    max-width: 95%;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: default;
  `;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(255, 255, 255, 1);
    color: #333;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.3s ease;
    z-index: 10001;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  closeBtn.onmouseenter = function () {
    this.style.background = 'rgba(255, 255, 255, 1)';
    this.style.transform = 'scale(1.15)';
    this.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
  };
  closeBtn.onmouseleave = function () {
    this.style.background = 'rgba(255, 255, 255, 0.9)';
    this.style.transform = 'scale(1)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  };
  closeBtn.onclick = function (e) {
    e.stopPropagation();
    closeImageModal(modal);
  };

  // Create image element
  const modalImage = document.createElement('img');
  modalImage.src = imageSrc;
  modalImage.alt = safeTitle;
  modalImage.title = safeTitle;
  modalImage.style.cssText = `
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: zoomIn 0.3s ease;
  `;

  // Add image title
  const imageTitleElement = document.createElement('div');
  imageTitleElement.textContent = safeTitle;
  imageTitleElement.style.cssText = `
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 20px;
    text-align: center;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  `;

  // Add zoom in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes zoomIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Assemble modal
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(modalImage);
  modalContent.appendChild(imageTitleElement);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Animate in
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
  });

  // Close on background click
  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeImageModal(modal);
    }
  });

  // Close on ESC key
  const escHandler = function (e) {
    if (e.key === 'Escape') {
      closeImageModal(modal);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Close on image load error
  modalImage.onerror = function () {
    console.log(`Modal image failed to load: ${imageSrc}`);
    closeImageModal(modal);
  };
}

function closeImageModal(modal) {
  modal.style.opacity = '0';
  setTimeout(() => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
    document.body.style.overflow = '';
  }, 300);
}

