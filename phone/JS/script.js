// Mobile-Optimized JavaScript for SHERIF-SIEGE-AUTO Website
import { createFooter } from './footer.js';
import { createMarquee } from './marquee.js';

// DOM Elements
let navbar;
let navToggle;
let navMenu;
let backToTopBtn;
let themeToggleBtn;

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeElements();
  setupEventListeners();
  initNewFeatures();
  setupContactForm();
  detectComponentImages();
  initCarSeatCarousel();
  setupCarBrands();
  setupCarBrands();
  setupScrollAnimations();
  setupFileUpload();
  
  // Initialize Footer
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
      createFooter(footerPlaceholder);
  }
});

// Initialize DOM elements
function initializeElements() {
  navbar = document.getElementById("navbar");
  navToggle = document.getElementById("nav-toggle");
  navMenu = document.getElementById("nav-menu");
  backToTopBtn = document.getElementById("back-to-top");
  themeToggleBtn = document.getElementById("theme-toggle");
}

// Setup event listeners
function setupEventListeners() {
  // Mobile navigation toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", toggleMobileMenu);
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      navMenu &&
      navMenu.classList.contains("active") &&
      !navToggle.contains(e.target) &&
      !navMenu.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // Close mobile menu when clicking on nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Back to top button
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", scrollToTop);
  }

  // Scroll events
  window.addEventListener("scroll", handleScroll);

  // Theme toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // Touch events for better mobile interaction
  setupTouchEvents();
}

// Mobile menu functions
function toggleMobileMenu() {
  if (navMenu.classList.contains("active")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  navMenu.classList.add("active");
  navToggle.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  navMenu.classList.remove("active");
  navToggle.classList.remove("active");
  document.body.style.overflow = "";
}

// Scroll handling
function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const isDarkMode =
    document.documentElement.getAttribute("data-theme") === "dark";

  // Navbar background
  if (navbar) {
    if (scrollTop > 100) {
      navbar.style.background = isDarkMode
        ? "rgba(26, 26, 26, 0.98)"
        : "rgba(255, 255, 255, 0.98)";
    } else {
      navbar.style.background = isDarkMode
        ? "rgba(26, 26, 26, 0.95)"
        : "rgba(255, 255, 255, 0.95)";
    }
  }

  // Back to top button
  if (backToTopBtn) {
    if (scrollTop > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  }

  // Active navigation link
  updateActiveNavLink();
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.offsetHeight;

    if (
      window.pageYOffset >= sectionTop &&
      window.pageYOffset < sectionTop + sectionHeight
    ) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentSection}`) {
      link.classList.add("active");
    }
  });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const offsetTop = section.offsetTop - 80; // Account for fixed navbar
    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  }
}

// Scroll to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Theme toggle functionality
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);

  // Update button icon
  const icon = themeToggleBtn.querySelector("i");

  if (newTheme === "dark") {
    icon.className = "fas fa-sun";
  } else {
    icon.className = "fas fa-moon";
  }
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector("i");

    if (savedTheme === "dark") {
      icon.className = "fas fa-sun";
    } else {
      icon.className = "fas fa-moon";
    }
  }
}

// Initialize theme on load
loadTheme();

// Touch events setup
function setupTouchEvents() {
  // Add touch feedback to buttons and cards
  const interactiveElements = document.querySelectorAll(
    ".btn, .advantage-card, .service-card, .info-card, .nav-link"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("touchstart", function () {
      this.style.transform = "scale(0.98)";
    });

    element.addEventListener("touchend", function () {
      this.style.transform = "";
    });
  });

  // Swipe gestures for car seat carousel
  setupSwipeGestures();
}

// Swipe gestures for mobile and mouse drag for desktop
function setupSwipeGestures() {
  const carSeatWrapper = document.querySelector(".car-seat-wrapper");
  if (!carSeatWrapper) return;

  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isHorizontal = false;

  // Touch events for mobile
  carSeatWrapper.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = false;
      isHorizontal = false;
    },
    { passive: true }
  );

  carSeatWrapper.addEventListener(
    "touchmove",
    function (e) {
      if (!startX || !startY) return;

      const diffX = startX - e.touches[0].clientX;
      const diffY = startY - e.touches[0].clientY;

      if (!isHorizontal && Math.abs(diffX) > 10) {
        isHorizontal = Math.abs(diffX) > Math.abs(diffY);
      }

      if (isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault();
        isDragging = true;
      }
    },
    { passive: false }
  );

  carSeatWrapper.addEventListener(
    "touchend",
    function (e) {
      if (!isDragging || !startX) {
        startX = 0;
        startY = 0;
        isDragging = false;
        isHorizontal = false;
        return;
      }

      const diffX = startX - e.changedTouches[0].clientX;
      const threshold = 50;

      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swipe left - next image
          nextCarSeatImage();
        } else {
          // Swipe right - previous image
          prevCarSeatImage();
        }
      }

      startX = 0;
      startY = 0;
      isDragging = false;
      isHorizontal = false;
    },
    { passive: true }
  );

  // Mouse events for desktop
  let mouseDown = false;
  let mouseStartX = 0;
  let mouseStartY = 0;

  carSeatWrapper.addEventListener("mousedown", function (e) {
    mouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
    isDragging = false;
    isHorizontal = false;
  });

  carSeatWrapper.addEventListener("mousemove", function (e) {
    if (!mouseDown) return;

    const diffX = mouseStartX - e.clientX;
    const diffY = mouseStartY - e.clientY;

    if (!isHorizontal && Math.abs(diffX) > 10) {
      isHorizontal = Math.abs(diffX) > Math.abs(diffY);
    }

    if (isHorizontal && Math.abs(diffX) > Math.abs(diffY)) {
      isDragging = true;
    }
  });

  carSeatWrapper.addEventListener("mouseup", function (e) {
    if (!mouseDown || !isDragging) {
      mouseDown = false;
      isDragging = false;
      isHorizontal = false;
      return;
    }

    const diffX = mouseStartX - e.clientX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Drag left - next image
        nextCarSeatImage();
      } else {
        // Drag right - previous image
        prevCarSeatImage();
      }
    }

    mouseDown = false;
    isDragging = false;
    isHorizontal = false;
  });

  carSeatWrapper.addEventListener("mouseleave", function () {
    mouseDown = false;
    isDragging = false;
    isHorizontal = false;
  });
}

// Contact form setup
function setupContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const fileInput = document.getElementById("file-upload");

    // Validation
    if (
      !formData.get("name") ||
      !formData.get("email") ||
      !formData.get("message")
    ) {
      showNotification("Please fill in all required fields.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.get("email"))) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;

    try {
      // Prepare payload
      const payload = new FormData();
      payload.append("name", formData.get("name"));
      payload.append("email", formData.get("email"));
      payload.append("phone", formData.get("phone") || "");
      payload.append("vehicle", formData.get("vehicle") || "");
      payload.append("message", formData.get("message"));
      payload.append("timestamp", new Date().toISOString());
      payload.append("source", "SHERIF-SIEGE-AUTO Mobile Website");

      // Handle file upload if present
      if (fileInput && fileInput.files.length > 0) {
        payload.append("file", fileInput.files[0]);
      }

      // Send to webhook
      const webhookUrl =
        "http://localhost:5678/webhook-test/f1a3160d-f1b7-46ae-bb3b-700ba002ea43";

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: payload,
      });

      if (response.ok) {
        showNotification(
          "Thank you for your message. We will contact you very soon!",
          "success"
        );
        contactForm.reset();
        // Reset file input display
        const fileNameDisplay = document.getElementById("file-name");
        if (fileNameDisplay) {
          fileNameDisplay.textContent = "No file chosen";
          fileNameDisplay.classList.remove("has-file");
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending form data:", error);
      showNotification(
        "There was an error sending your message. Please try again or call us directly.",
        "error"
      );
    } finally {
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  });
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${
              type === "success"
                ? "fa-check-circle"
                : type === "error"
                ? "fa-exclamation-circle"
                : "fa-info-circle"
            }"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${
          type === "success"
            ? "#4CAF50"
            : type === "error"
            ? "#F44336"
            : "#2196F3"
        };
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 90%;
        animation: slideDown 0.3s ease;
    `;

  // Add animation styles
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
        }
    `;
  document.head.appendChild(style);

  // Add to document
  document.body.appendChild(notification);

  // Close button functionality
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.addEventListener("click", () => {
    notification.remove();
  });

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

// Car seat carousel functionality
let currentSeatIndex = 0;
let seatImages = [];
let dotsContainer;
let autoRotateTimer;

async function detectComponentImages() {
  try {
    // List of known images
    const knownImages = [
      "images/Gallery/Black-&-Orange.png",
      "images/Gallery/Black-&-Red.png",
      "images/Gallery/Blue.png",
      "images/Gallery/Dark-blue-&-white.png",
      "images/Gallery/Red.png",
    ];

    // Combine known images with detected additional images
    const allImages = [...knownImages];

    console.log("Detected images:", allImages);

    return allImages;
  } catch (error) {
    console.log("Using fallback images");
    return [
      "images/Gallery/Black-&-Orange.png",
      "images/Gallery/Black-&-Red.png",
      "images/Gallery/Blue.png",
      "images/Gallery/Dark-blue-&-white.png",
      "images/Gallery/Red.png",
    ];
  }
}
async function initCarSeatCarousel() {
  seatImages = await detectComponentImages();

  if (seatImages.length === 0) {
    console.log("No car seat images found");
    return;
  }

  const carSeatWrapper = document.querySelector(".car-seat-wrapper");
  if (!carSeatWrapper) return;

  // Create initial image element with smooth fade-in
  const img = createSeatImage(seatImages[0]);
  img.classList.add("active");
  carSeatWrapper.appendChild(img);

  // Build dots
  buildCarouselDots();

  // Auto-rotate images every 3 seconds
  startAutoRotate();
}

function nextCarSeatImage() {
  if (seatImages.length === 0) return;

  currentSeatIndex = (currentSeatIndex + 1) % seatImages.length;
  updateCarSeatImage();
}

function prevCarSeatImage() {
  if (seatImages.length === 0) return;

  currentSeatIndex =
    (currentSeatIndex - 1 + seatImages.length) % seatImages.length;
  updateCarSeatImage();
}

function updateCarSeatImage() {
  const wrapper = document.querySelector(".car-seat-wrapper");
  if (!wrapper || !seatImages[currentSeatIndex]) return;

  const current =
    wrapper.querySelector(".carousel-image.active") ||
    wrapper.querySelector(".carousel-image");
  const nextImg = createSeatImage(seatImages[currentSeatIndex]);
  wrapper.appendChild(nextImg);

  // Allow layout to apply before toggling classes for transition
  requestAnimationFrame(() => {
    nextImg.classList.add("active");
    if (current) current.classList.remove("active");
  });

  if (current) {
    current.addEventListener(
      "transitionend",
      () => {
        if (current.parentNode) current.parentNode.removeChild(current);
      },
      { once: true }
    );
  }

  updateCarouselDots();
}

function createSeatImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Car Seat Restoration";
  img.className = "carousel-image";
  return img;
}

function startAutoRotate() {
  stopAutoRotate();
  autoRotateTimer = setInterval(() => {
    nextCarSeatImage();
  }, 4000);
}

function stopAutoRotate() {
  if (autoRotateTimer) {
    clearInterval(autoRotateTimer);
    autoRotateTimer = null;
  }
}

// Build carousel dots dynamically
function buildCarouselDots() {
  dotsContainer = document.querySelector(".carousel-dots");
  if (!dotsContainer) return;

  dotsContainer.innerHTML = "";
  seatImages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className =
      "carousel-dot" + (index === currentSeatIndex ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.setAttribute(
      "aria-selected",
      index === currentSeatIndex ? "true" : "false"
    );
    dot.addEventListener("click", () => {
      currentSeatIndex = index;
      updateCarSeatImage();
      startAutoRotate();
    });
    dotsContainer.appendChild(dot);
  });
}

// Update active state of dots
function updateCarouselDots() {
  if (!dotsContainer) dotsContainer = document.querySelector(".carousel-dots");
  if (!dotsContainer) return;
  const dots = dotsContainer.querySelectorAll(".carousel-dot");
  dots.forEach((dot, index) => {
    if (index === currentSeatIndex) {
      dot.classList.add("active");
      dot.setAttribute("aria-selected", "true");
    } else {
      dot.classList.remove("active");
      dot.setAttribute("aria-selected", "false");
    }
  });
}

// Initialize new features
function initNewFeatures() {
  // Add loading states to buttons
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!this.disabled) {
        this.style.transform = "scale(0.98)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);
      }
    });
  });

  // Add hover effects for cards on desktop
  if (!("ontouchstart" in window)) {
    const cards = document.querySelectorAll(
      ".advantage-card, .service-card, .info-card"
    );
    cards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-5px)";
      });

      card.addEventListener("mouseleave", function () {
        this.style.transform = "";
      });
    });
  }

  // Lazy loading for images
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => imageObserver.observe(img));
  }
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimize scroll events
const optimizedScrollHandler = debounce(handleScroll, 10);
window.removeEventListener("scroll", handleScroll);
window.addEventListener("scroll", optimizedScrollHandler);

// Performance monitoring
if ("performance" in window) {
  window.addEventListener("load", function () {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0];
      console.log(
        "Page load time:",
        perfData.loadEventEnd - perfData.loadEventStart,
        "ms"
      );
    }, 0);
  });
}

// Service Worker registration for PWA capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("ServiceWorker registration successful");
      })
      .catch(function (err) {
        console.log("ServiceWorker registration failed");
      });
  });
}

// Car Brands Section Setup
// Car Brands Section Setup
function setupCarBrands() {
  const container = document.querySelector(".car-brands-container");
  if (!container) return;

  // Clear existing content
  container.innerHTML = '';

  // List of car brand image filenames from images/Car Brands folder
  const carBrands = [
    "images/Car Brands/Sans-titre-1.png",
    "images/Car Brands/Sans-titre-2.png",
    "images/Car Brands/Sans-titre-3.png",
    "images/Car Brands/Sans-titre-4.png",
    "images/Car Brands/Sans-titre-5.png",
    "images/Car Brands/Sans-titre-6.png",
    "images/Car Brands/Sans-titre-7.png",
    "images/Car Brands/Sans-titre-8.png",
    "images/Car Brands/Sans-titre-9.png",
    "images/Car Brands/Sans-titre-10.png",
    "images/Car Brands/Sans-titre-11.png",
    "images/Car Brands/Sans-titre-12.png",
    "images/Car Brands/Sans-titre-13.png",
    "images/Car Brands/Sans-titre-14.png",
  ];

  // Map to HTML strings
  const itemsHtml = carBrands.map(brand => {
      const altText = brand.split('/').pop().replace('.png', '').replace('Sans-titre-', 'Brand ');
      return `
        <div class="marquee-brand-item">
            <img src="${brand}" alt="${altText}" onerror="this.style.display='none'">
        </div>
      `;
  });

  // Initialize Marquee
  createMarquee({
      target: container,
      items: itemsHtml,
      speed: 40,
      pauseOnHover: true,
      className: 'brand-marquee'
  });
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.nextCarSeatImage = nextCarSeatImage;
window.prevCarSeatImage = prevCarSeatImage;

// Scroll Animations
// Scroll Animations
function setupScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  const elements = document.querySelectorAll(".animate-on-scroll");
  elements.forEach((el) => observer.observe(el));
}

// File Upload Setup
function setupFileUpload() {
  const fileInput = document.getElementById("file-upload");
  const fileNameDisplay = document.getElementById("file-name");
  const wrapper = document.querySelector(".file-upload-wrapper");
  const label = document.querySelector(".file-upload-label");

  if (fileInput && fileNameDisplay && wrapper) {
    // Make the entire wrapper clickable
    wrapper.addEventListener("click", function (e) {
      // Prevent double-triggering if clicking the label or input directly
      if (e.target !== fileInput && !e.target.closest("label")) {
        fileInput.click();
      }
    });

    fileInput.addEventListener("change", function (e) {
      console.log("File input changed:", this.files);
      if (this.files && this.files.length > 0) {
        const file = this.files[0];
        fileNameDisplay.textContent = file.name;
        wrapper.classList.add("has-file");

        // Create or update preview
        if (file.type.startsWith("image/")) {
          wrapper.classList.add("has-image");
          const reader = new FileReader();
          reader.onload = function (e) {
            wrapper.style.backgroundImage = `url('${e.target.result}')`;
            wrapper.style.backgroundSize = "cover";
            wrapper.style.backgroundPosition = "center";

            // Update label for better visibility over image
            if (label) {
              label.innerHTML =
                '<i class="fas fa-sync-alt"></i><span>Change</span>';
              label.style.background = "rgba(255, 255, 255, 0.9)";
              label.style.padding = "6px 12px";
              label.style.borderRadius = "20px";
              label.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
              label.style.color = "var(--primary-dark)";
              label.style.fontWeight = "600";
            }
          };
          reader.readAsDataURL(file);
        } else {
          // Non-image file
          wrapper.classList.remove("has-image");
          wrapper.style.backgroundImage = "none";
          if (label) {
            label.innerHTML =
              '<i class="fas fa-file-check"></i><span>File Selected</span>';
            label.style.background = "transparent";
            label.style.padding = "0";
            label.style.boxShadow = "none";
            label.style.color = "var(--success)";
          }
        }
      } else {
        // Reset state
        fileNameDisplay.textContent = "No file chosen";
        wrapper.classList.remove("has-file");
        wrapper.classList.remove("has-image");
        wrapper.style.backgroundImage = "none";

        if (label) {
          label.innerHTML =
            '<i class="fas fa-cloud-upload-alt"></i><span>Choose File</span>';
          label.style.background = "transparent";
          label.style.padding = "0";
          label.style.boxShadow = "none";
          label.style.color = "var(--text-secondary)";
          label.style.fontWeight = "normal";
        }
      }
    });
  }
}

/* =========================================
   Modern Features - Logic
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  initVisualizer();
  initCompatibilityChecker();
});

// --- Visualizer Logic ---
function initVisualizer() {
  const colorBtns = document.querySelectorAll(".color-btn");
  const overlay = document.getElementById("visualizerOverlay");
  const nameDisplay = document.querySelector(".selected-color-name");

  if (!colorBtns.length || !overlay) return;

  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class
      colorBtns.forEach((b) => b.classList.remove("active"));
      // Add active class
      btn.classList.add("active");

      // Update Overlay
      const color = btn.dataset.color;
      const name = btn.dataset.name;

      overlay.style.backgroundColor = color;
      if (nameDisplay) nameDisplay.textContent = name;

      // Haptic
      if (navigator.vibrate) navigator.vibrate(30);
    });
  });
}

// --- Compatibility Checker Logic ---
function initCompatibilityChecker() {
  const brandSelect = document.getElementById("heroBrandSelect");
  const modelSelect = document.getElementById("heroModelSelect");
  const resultDiv = document.getElementById("compatibilityResult");

  if (!brandSelect || !modelSelect) return;

  // Use absolute path relative to domain root or relative path
  // Since this runs in phone/index.html, and data is in ../DATA/vehicles.csv (which I created in DATA sibling to phone)
  // Actually, I put vehicles.csv in 'DATA' sibling to 'phone'.
  // So if the URL is /phone/index.html, then ../DATA/vehicles.csv is correct.
  // Use correct path to JSON
  const dataPath = "DATA/vehicles.json";
  let vehicleData = [];

  // Fetch Data
  fetch(dataPath)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    })
    .then(data => {
      // Store data directly
      vehicleData = data;

      // Populate Brands
      const brands = [...new Set(vehicleData.map((v) => v.brand))].sort();

      brands.forEach((brand) => {
        const opt = document.createElement("option");
        opt.value = brand;
        opt.textContent = brand;
        brandSelect.appendChild(opt);
      });
    })
    .catch((err) => {
      console.error("Error loading vehicle data for checker:", err);
      resultDiv.innerHTML = '<span style="color:red">Unable to load vehicle database.</span>';
    });

  // On Brand Change
  brandSelect.addEventListener("change", () => {
    const selectedBrand = brandSelect.value;
    modelSelect.innerHTML = '<option value="">Select Model</option>';
    resultDiv.textContent = "";

    if (!selectedBrand) {
      modelSelect.disabled = true;
      return;
    }

    const models = [
      ...new Set(
        vehicleData.filter((v) => v.brand === selectedBrand).map((v) => v.model)
      ),
    ].sort();

    models.forEach((model) => {
      const opt = document.createElement("option");
      opt.value = model;
      opt.textContent = model;
      modelSelect.appendChild(opt);
    });

    modelSelect.disabled = false;

    // Haptic
    if (navigator.vibrate) navigator.vibrate(20);
  });

  // On Model Change
  modelSelect.addEventListener("change", () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;

    if (brand && model) {
      // Count how many we have done (fake or real count from CSV)
      const count = vehicleData.filter(
        (v) => v.brand === brand && v.model === model
      ).length;

      if (count > 0) {
        resultDiv.innerHTML =
          '<i class="fas fa-check-circle"></i> We have worked on <b>' +
          count +
          "</b> " +
          brand +
          " " +
          model +
          "(s)!";
        resultDiv.style.color = "var(--success)";
      } else {
        resultDiv.innerHTML =
          '<i class="fas fa-check-circle"></i> We are compatible with ' +
          brand +
          " " +
          model +
          "!";
        resultDiv.style.color = "var(--primary)";
      }
      // Haptic
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    } else {
      resultDiv.textContent = "";
    }
  });
}
