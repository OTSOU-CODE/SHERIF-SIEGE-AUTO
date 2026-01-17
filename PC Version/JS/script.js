// Mobile-Optimized JavaScript for SHERIF-SIEGE-AUTO Website

// DOM Elements
let navbar;
let navToggle;
let navMenu;
let backToTopBtn;
let themeToggleBtn;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeElements();
    setupEventListeners();
    initNewFeatures();
    setupContactForm();
    detectComponentImages();
    initCarSeatCarousel();
    setupCarBrands();
    setupScrollAnimations();
    setupFileUpload();
    initHeaderSearch();
});

// Initialize DOM elements
function initializeElements() {
    navbar = document.getElementById('navbar');
    navToggle = document.getElementById('nav-toggle');
    navMenu = document.getElementById('nav-menu');
    backToTopBtn = document.getElementById('back-to-top');
    themeToggleBtn = document.getElementById('theme-toggle');
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        if (navMenu && navMenu.classList.contains('active') &&
            !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Close mobile menu when clicking on nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Back to top button
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }

    // Scroll events
    window.addEventListener('scroll', handleScroll);

    // Close mobile menu when resizing to desktop to avoid stuck open overlay
    window.addEventListener('resize', debounce(handleResize, 150));

    // Theme toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Touch events for better mobile interaction
    setupTouchEvents();
}

function handleResize() {
    if (window.innerWidth >= 768 && navMenu && navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
}

// Mobile menu functions
function toggleMobileMenu() {
    if (navMenu.classList.contains('active')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    navMenu.classList.add('active');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Scroll handling
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    // Navbar shrink-on-scroll toggle (class-based)
    if (navbar) {
        // Add scrolled class after user scrolls down 50px for a compact header
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Back to top button
    if (backToTopBtn) {
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Active navigation link
    updateActiveNavLink();
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;

        if (window.pageYOffset >= sectionTop &&
            window.pageYOffset < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Account for current navbar height (dynamic on scroll)
        let navHeight = 80;
        if (navbar) {
            const cssNavHeight = getComputedStyle(navbar).getPropertyValue('--navbar-height');
            if (cssNavHeight) {
                navHeight = parseInt(cssNavHeight, 10) || navHeight;
            }
        }
        const offsetTop = section.offsetTop - navHeight;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Theme toggle functionality
// Theme toggle functionality
function toggleTheme(event) {
    // Check if View Transitions are supported
    if (!document.startViewTransition) {
        performThemeToggle();
        return;
    }

    // Get click coordinates
    const x = event ? event.clientX : window.innerWidth / 2;
    const y = event ? event.clientY : window.innerHeight / 2;
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    // Determine current and next theme
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    
    // Set a class to handle z-index stacking in CSS
    // If going Dark -> Light (isDark is true currently), we want the Old view (Dark) on top to shrink
    if (isDark) {
        root.classList.add('theme-transition-back');
    }

    const transition = document.startViewTransition(() => {
        performThemeToggle();
    });

    transition.ready.then(() => {
        // If we were Dark (isDark=true), we are now going to Light.
        // We want the OLD view (Dark) to shrink from full radius to 0 at the click point.
        // If we were Light (isDark=false), we are now going to Dark.
        // We want the NEW view (Dark) to expand from 0 to full radius.
        
        if (isDark) {
            // Dark -> Light: Animate OLD view (Dark) shrinking
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                        `circle(0px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-old(root)",
                }
            );
        } else {
            // Light -> Dark: Animate NEW view (Dark) expanding
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            );
        }
    });

    // Clean up class after transition
    transition.finished.then(() => {
        root.classList.remove('theme-transition-back');
    });
}

function performThemeToggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update button icon
    const icon = themeToggleBtn.querySelector('i');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggleBtn.classList.remove('rotating');
        themeToggleBtn.setAttribute('aria-pressed', newTheme === 'dark');
        return;
    }

    // Add a quick rotation cue
    themeToggleBtn.classList.add('rotating');
    setTimeout(() => {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        setTimeout(() => themeToggleBtn.classList.remove('rotating'), 260);
    }, 120);

    themeToggleBtn.setAttribute('aria-pressed', newTheme === 'dark');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');

        if (savedTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

// Initialize theme on load
loadTheme();

// Touch events setup
function setupTouchEvents() {
    // Add touch feedback to buttons and cards
    const interactiveElements = document.querySelectorAll('.btn, .advantage-card, .service-card, .info-card, .nav-link');

    interactiveElements.forEach(element => {
        element.addEventListener('touchstart', function () {
            this.style.transform = 'scale(0.98)';
        });

        element.addEventListener('touchend', function () {
            this.style.transform = '';
        });
    });

    // Swipe gestures for car seat carousel
    setupSwipeGestures();
}

// Swipe gestures for mobile and mouse drag for desktop
function setupSwipeGestures() {
    const carSeatWrapper = document.querySelector('.car-seat-wrapper');
    if (!carSeatWrapper) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let isHorizontal = false;

    // Touch events for mobile
    carSeatWrapper.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = false;
        isHorizontal = false;
    }, { passive: true });

    carSeatWrapper.addEventListener('touchmove', function (e) {
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
    }, { passive: false });

    carSeatWrapper.addEventListener('touchend', function (e) {
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
    }, { passive: true });

    // Mouse events for desktop
    let mouseDown = false;
    let mouseStartX = 0;
    let mouseStartY = 0;

    carSeatWrapper.addEventListener('mousedown', function (e) {
        mouseDown = true;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        isDragging = false;
        isHorizontal = false;
    });

    carSeatWrapper.addEventListener('mousemove', function (e) {
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

    carSeatWrapper.addEventListener('mouseup', function (e) {
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

    carSeatWrapper.addEventListener('mouseleave', function () {
        mouseDown = false;
        isDragging = false;
        isHorizontal = false;
    });
}

// Contact form setup
function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    // Inline Validation
    const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateInput(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) validateInput(input);
        });
    });

    function validateInput(input) {
        if (input.checkValidity()) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
            input.classList.remove('valid');
        }
    }

    // File Upload Drag & Drop
    const fileWrapper = document.querySelector('.file-upload-wrapper');
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');

    if (fileWrapper && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileWrapper.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileWrapper.addEventListener(eventName, () => fileWrapper.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileWrapper.addEventListener(eventName, () => fileWrapper.classList.remove('drag-over'), false);
        });

        fileWrapper.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            fileInput.files = files;
            updateFileName(files);
        });

        fileInput.addEventListener('change', () => {
            updateFileName(fileInput.files);
        });

        function updateFileName(files) {
            if (files && files.length > 0) {
                fileNameDisplay.textContent = files[0].name;
                fileNameDisplay.classList.add('has-file');
                fileWrapper.classList.add('valid');
            } else {
                fileNameDisplay.textContent = 'No file chosen';
                fileNameDisplay.classList.remove('has-file');
                fileWrapper.classList.remove('valid');
            }
        }
    }

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validate all before submit
        let isValid = true;
        inputs.forEach(input => {
            validateInput(input);
            if (!input.checkValidity()) isValid = false;
        });

        if (!isValid) {
            showNotification('Please correct the highlighted fields.', 'error');
            return;
        }

        const formData = new FormData(contactForm);

        // Validation (Email Regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.get('email'))) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;

        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;

        try {
            // Prepare payload
            const payload = new FormData();
            payload.append('name', formData.get('name'));
            payload.append('email', formData.get('email'));
            payload.append('phone', formData.get('phone') || '');
            payload.append('vehicle', formData.get('vehicle') || '');
            payload.append('message', formData.get('message'));
            payload.append('timestamp', new Date().toISOString());
            payload.append('source', 'SHERIF-SIEGE-AUTO Website');

            // Handle file upload if present
            if (fileInput && fileInput.files.length > 0) {
                payload.append('file', fileInput.files[0]);
            }

            // Simulate sending (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success
            showNotification('Thank you for your message. We will contact you very soon!', 'success');
            contactForm.reset();
            // Reset validation classes
            inputs.forEach(input => input.classList.remove('valid', 'invalid'));
            
            // Reset file input display
            if (fileNameDisplay) {
                fileNameDisplay.textContent = 'No file chosen';
                fileNameDisplay.classList.remove('has-file');
                if (fileWrapper) fileWrapper.classList.remove('valid');
            }
            
        } catch (error) {
            console.error('Error sending form data:', error);
            showNotification('There was an error sending your message. Please try again or call us directly.', 'error');
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
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
    const style = document.createElement('style');
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
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Header Search Functionality
function initHeaderSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('header-search-input');
    const searchResults = document.getElementById('header-search-results');
    
    if (!searchToggle || !searchContainer || !searchInput) return;

    // Load History
    const loadHistory = () => {
        try {
            return JSON.parse(localStorage.getItem('searchHistory') || '[]');
        } catch (e) {
            console.error('Failed to load search history', e);
            return [];
        }
    };

    const saveHistory = (term) => {
        try {
            let history = loadHistory();
            if (!history.includes(term)) {
                history.unshift(term);
                if (history.length > 5) history.pop(); // Keep last 5
                localStorage.setItem('searchHistory', JSON.stringify(history));
            }
        } catch (e) {
            console.error('Failed to save search history', e);
        }
    };

    // Data Loading
    let vehicleData = [];
    const csvPath = "../DATA/vehicles.csv";
    
    // Services Data (Hardcoded for now)
    const servicesData = [
        { name: "Leather Restoration", type: "service", url: 'category.html?q=leather' },
        { name: "Seat Repair", type: "service", url: 'category.html?q=seat' },
        { name: "Dashboard Restoration", type: "service", url: 'category.html?q=dashboard' },
        { name: "Custom Stitching", type: "service", url: 'category.html?q=custom' },
        { name: "Headliner Replacement", type: "service", url: 'category.html?q=roof' },
        { name: 'Contact Us', type: 'page', url: '#contact' },
        { name: 'About Us', type: 'page', url: '#why-choose-us' },
        { name: 'Our Work', type: 'page', url: 'gallery.html' }
    ];

    fetch(csvPath)
        .then((response) => response.ok ? response.text() : Promise.reject("Failed to load"))
        .then((text) => {
            const lines = text.split("\n").filter((l) => l.trim());
            const start = lines[0].toLowerCase().includes("brand") ? 1 : 0;
            vehicleData = lines.slice(start).map((line) => {
                const cols = line.split(",");
                if (cols.length >= 2) {
                    return {
                        brand: cols[0].trim(),
                        model: cols[1].trim(),
                        year: cols[2] ? cols[2].trim() : "",
                    };
                }
                return null;
            }).filter((i) => i);
        })
        .catch((err) => console.log("Header search data error:", err));

    let debounceTimer;

    const renderResults = (vehicleMatches, serviceMatches, isHistory = false) => {
        if (!searchResults) return;
        searchResults.innerHTML = '';
        
        if (isHistory && vehicleMatches.length > 0) {
             const historyHeader = document.createElement('div');
             historyHeader.className = 'search-header';
             historyHeader.textContent = 'Recent Searches';
             historyHeader.style.padding = '8px 12px';
             historyHeader.style.fontSize = '0.8rem';
             historyHeader.style.color = 'var(--text-secondary)';
             searchResults.appendChild(historyHeader);

             vehicleMatches.forEach(item => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = `<span><i class="fas fa-history" style="margin-right: 8px; opacity: 0.6;"></i>${item}</span>`;
                div.addEventListener('click', () => {
                    searchInput.value = item;
                    performSearch(item);
                });
                searchResults.appendChild(div);
             });
             searchResults.classList.add('active');
             searchResults.style.display = 'block';
             return;
        }

        if (vehicleMatches.length === 0 && serviceMatches.length === 0) {
            searchResults.classList.remove('active');
            searchResults.style.display = 'none';
            return;
        }

        let html = "";

        if (vehicleMatches.length > 0) {
            html += `<div style="padding: 8px 12px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">VEHICLES</div>`;
            vehicleMatches.forEach((v) => {
                html += `
                        <div class="search-result-item" onclick="location.href='category.html?search=${encodeURIComponent(v.brand + " " + v.model)}'">
                                <i class="fas fa-car"></i>
                                <span>${v.brand} ${v.model} ${v.year}</span>
                        </div>
                  `;
            });
        }

        if (serviceMatches.length > 0) {
            html += `<div style="padding: 8px 12px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-top: 5px;">SERVICES & PAGES</div>`;
            serviceMatches.forEach((s) => {
                html += `
                        <div class="search-result-item" onclick="location.href='${s.url}'">
                                <i class="fas ${s.type === 'page' ? 'fa-link' : 'fa-tools'}"></i>
                                <span>${s.name}</span>
                        </div>
                  `;
            });
        }

        searchResults.innerHTML = html;
        searchResults.classList.add("active");
        searchResults.style.display = 'block';
    };

    const performSearch = (query) => {
        if (!query) {
            renderResults(loadHistory(), [], true);
            return;
        }
        
        // Filter Vehicles
        const vehicleMatches = vehicleData.filter((v) =>
            v.brand.toLowerCase().includes(query.toLowerCase()) ||
            v.model.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);

        // Filter Services
        const serviceMatches = servicesData.filter((s) => 
            s.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3);
        
        renderResults(vehicleMatches, serviceMatches);
    };

    // Toggle Search Bar
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        searchContainer.classList.toggle('active');
        if (searchContainer.classList.contains('active')) {
            setTimeout(() => {
                searchInput.focus();
                performSearch(''); // Show history on open
            }, 100);
        }
    });
        
    // Close when clicking outside
    document.addEventListener('click', (e) => {
            if (searchContainer.classList.contains('active') && !searchContainer.contains(e.target) && !searchToggle.contains(e.target)) {
                searchContainer.classList.remove('active');
                if (searchResults) {
                    searchResults.classList.remove('active');
                    searchResults.style.display = 'none';
                }
            }
    });
    
    // Input Handler with Debounce
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const val = e.target.value.trim();
            if (val.length > 0) {
                saveHistory(val);
            }
            performSearch(val);
        }, 300);
    });

    searchInput.addEventListener('focus', () => {
        if (!searchInput.value) performSearch('');
    });

    // Handle Enter Key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = searchInput.value.trim();
            if (val) {
                saveHistory(val);
                window.location.href = `category.html?search=${encodeURIComponent(val)}`;
            }
        }
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Press '/' to focus search
        if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault(); 
            searchContainer.classList.add('active');
            setTimeout(() => {
                searchInput.focus();
                performSearch('');
            }, 100);
        }
        
        // Close on Escape
        if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
            searchContainer.classList.remove('active');
            searchInput.blur();
            if (searchResults) {
                searchResults.classList.remove('active');
                searchResults.style.display = 'none';
            }
        }
    });
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
            'images/gallery/Black-&-Orange.webp',
            'images/gallery/Black-&-Red.webp',
            'images/gallery/Blue.webp',
            'images/gallery/Dark-blue-&-white.webp',
            'images/gallery/Red.webp'
        ];

        // Combine known images with detected additional images
        const allImages = [...knownImages];

        console.log('Detected images:', allImages);

        return allImages;
    } catch (error) {
        console.log('Using fallback images');
        return [
            'images/gallery/Black-&-Orange.webp',
            'images/gallery/Black-&-Red.webp',
            'images/gallery/Blue.webp',
            'images/gallery/Dark-blue-&-white.webp',
            'images/gallery/Red.webp'
        ];
    }
}
async function initCarSeatCarousel() {
    seatImages = await detectComponentImages();

    if (seatImages.length === 0) {
        console.log('No car seat images found');
        return;
    }

    const carSeatWrapper = document.querySelector('.car-seat-wrapper');
    if (!carSeatWrapper) return;

    // Create initial image element with smooth fade-in
    const img = createSeatImage(seatImages[0]);
    img.classList.add('active');
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

    currentSeatIndex = (currentSeatIndex - 1 + seatImages.length) % seatImages.length;
    updateCarSeatImage();
}

function updateCarSeatImage() {
    const wrapper = document.querySelector('.car-seat-wrapper');
    if (!wrapper || !seatImages[currentSeatIndex]) return;

    const current = wrapper.querySelector('.carousel-image.active') || wrapper.querySelector('.carousel-image');
    const nextImg = createSeatImage(seatImages[currentSeatIndex]);
    wrapper.appendChild(nextImg);

    // Allow layout to apply before toggling classes for transition
    requestAnimationFrame(() => {
        nextImg.classList.add('active');
        if (current) current.classList.remove('active');
    });

    if (current) {
        current.addEventListener('transitionend', () => {
            if (current.parentNode) current.parentNode.removeChild(current);
        }, { once: true });
    }

    updateCarouselDots();
}

function createSeatImage(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Car Seat Restoration';
    img.className = 'carousel-image';
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
    dotsContainer = document.querySelector('.carousel-dots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    seatImages.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (index === currentSeatIndex ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === currentSeatIndex ? 'true' : 'false');
        dot.addEventListener('click', () => {
            currentSeatIndex = index;
            updateCarSeatImage();
            startAutoRotate();
        });
        dotsContainer.appendChild(dot);
    });
}

// Update active state of dots
function updateCarouselDots() {
    if (!dotsContainer) dotsContainer = document.querySelector('.carousel-dots');
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        if (index === currentSeatIndex) {
            dot.classList.add('active');
            dot.setAttribute('aria-selected', 'true');
        } else {
            dot.classList.remove('active');
            dot.setAttribute('aria-selected', 'false');
        }
    });
}

// Initialize new features
function initNewFeatures() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            if (!this.disabled) {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    // Add hover effects for cards on desktop
    if (!('ontouchstart' in window)) {
        const cards = document.querySelectorAll('.advantage-card, .service-card, .info-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transform = 'translateY(-5px)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.transform = '';
            });
        });
    }

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
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
window.removeEventListener('scroll', handleScroll);
window.addEventListener('scroll', optimizedScrollHandler);
// Initialize state immediately
optimizedScrollHandler();

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function () {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        }, 0);
    });
}

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function (err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Car Brands Section Setup
function setupCarBrands() {
    // Function disabled: Replaced by Marquee component in index.html
    const track = document.querySelector('.car-brands-track');
    if (track) track.style.display = 'none'; // Ensure old track is hidden if it exists
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
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
}

// File Upload Setup
function setupFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const wrapper = document.querySelector('.file-upload-wrapper');
    const label = document.querySelector('.file-upload-label');

    if (fileInput && fileNameDisplay && wrapper) {
        // Make the entire wrapper clickable
        wrapper.addEventListener('click', function (e) {
            // Prevent double-triggering if clicking the label or input directly
            if (e.target !== fileInput && !e.target.closest('label')) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', function (e) {
            console.log('File input changed:', this.files);
            if (this.files && this.files.length > 0) {
                const file = this.files[0];
                fileNameDisplay.textContent = file.name;
                wrapper.classList.add('has-file');

                // Create or update preview
                if (file.type.startsWith('image/')) {
                    wrapper.classList.add('has-image');
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        wrapper.style.backgroundImage = `url('${e.target.result}')`;
                        wrapper.style.backgroundSize = 'cover';
                        wrapper.style.backgroundPosition = 'center';

                        // Update label for better visibility over image
                        if (label) {
                            label.innerHTML = '<i class="fas fa-sync-alt"></i><span>Change</span>';
                            label.style.background = 'rgba(255, 255, 255, 0.9)';
                            label.style.padding = '6px 12px';
                            label.style.borderRadius = '20px';
                            label.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                            label.style.color = 'var(--primary-dark)';
                            label.style.fontWeight = '600';
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    // Non-image file
                    wrapper.classList.remove('has-image');
                    wrapper.style.backgroundImage = 'none';
                    if (label) {
                        label.innerHTML = '<i class="fas fa-file-check"></i><span>File Selected</span>';
                        label.style.background = 'transparent';
                        label.style.padding = '0';
                        label.style.boxShadow = 'none';
                        label.style.color = 'var(--success)';
                    }
                }
            } else {
                // Reset state
                fileNameDisplay.textContent = 'No file chosen';
                wrapper.classList.remove('has-file');
                wrapper.classList.remove('has-image');
                wrapper.style.backgroundImage = 'none';

                if (label) {
                    label.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Choose File</span>';
                    label.style.background = 'transparent';
                    label.style.padding = '0';
                    label.style.boxShadow = 'none';
                    label.style.color = 'var(--text-secondary)';
                    label.style.fontWeight = 'normal';
                }
            }
        });
    }
}




/* =========================================
   Modern Features - Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initVisualizer();
    initCompatibilityChecker();
});

// --- Visualizer Logic ---
function initVisualizer() {
    const colorBtns = document.querySelectorAll('.color-btn');
    const overlay = document.getElementById('visualizerOverlay');
    const nameDisplay = document.querySelector('.selected-color-name');

    if (!colorBtns.length || !overlay) return;

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            colorBtns.forEach(b => b.classList.remove('active'));
            // Add active class
            btn.classList.add('active');
            
            // Update Overlay
            const color = btn.dataset.color;
            const name = btn.dataset.name;
            
            overlay.style.backgroundColor = color;
            if(nameDisplay) nameDisplay.textContent = name;
            
            // Haptic
            if(navigator.vibrate) navigator.vibrate(30);
        });
    });
}

// --- Compatibility Checker Logic ---
function initCompatibilityChecker() {
    const brandSelect = document.getElementById('heroBrandSelect');
    const modelSelect = document.getElementById('heroModelSelect');
    const resultDiv = document.getElementById('compatibilityResult');
    
    if (!brandSelect || !modelSelect) return;

    // Use absolute path relative to domain root or relative path
    // Since this runs in phone/index.html, and data is in ../DATA/vehicles.csv (which I created in DATA sibling to phone)
    // Actually, I put vehicles.csv in 'DATA' sibling to 'phone'.
    // So if the URL is /phone/index.html, then ../DATA/vehicles.csv is correct.
    const csvPath = '../DATA/vehicles.csv';
    let vehicleData = [];

    // Fetch Data
    fetch(csvPath)
        .then(res => {
             if(!res.ok) throw new Error('Failed to load');
             return res.text();
        })
        .then(text => {
            // Simple CSV Parser
            const lines = text.split('\n').filter(l => l.trim());
            // Skip header if present
            const startIndex = lines[0].toLowerCase().includes('brand') ? 1 : 0;
            
            // Parse into objects
            vehicleData = lines.slice(startIndex).map(line => {
                const cols = line.split(',');
                if (cols.length < 2) return null;
                return {
                    brand: cols[0].trim(),
                    model: cols[1].trim(),
                };
            }).filter(item => item !== null);

            // Populate Brands
            const brands = [...new Set(vehicleData.map(v => v.brand))].sort();
            
            brands.forEach(brand => {
                const opt = document.createElement('option');
                opt.value = brand;
                opt.textContent = brand;
                brandSelect.appendChild(opt);
            });
        })
        .catch(err => {
            console.error('Error loading vehicle data for checker:', err);
            // Fallback provided by catch
        });

    // On Brand Change
    brandSelect.addEventListener('change', () => {
        const selectedBrand = brandSelect.value;
        modelSelect.innerHTML = '<option value="">Select Model</option>';
        resultDiv.textContent = '';
        
        if (!selectedBrand) {
            modelSelect.disabled = true;
            return;
        }

        const models = [...new Set(
            vehicleData
                .filter(v => v.brand === selectedBrand)
                .map(v => v.model)
        )].sort();

        models.forEach(model => {
            const opt = document.createElement('option');
            opt.value = model;
            opt.textContent = model;
            modelSelect.appendChild(opt);
        });

        modelSelect.disabled = false;
        
        // Haptic
        if(navigator.vibrate) navigator.vibrate(20);
    });

    // On Model Change
    modelSelect.addEventListener('change', () => {
        const brand = brandSelect.value;
        const model = modelSelect.value;
        
        if (brand && model) {
            // Count how many we have done (fake or real count from CSV)
            const count = vehicleData.filter(v => v.brand === brand && v.model === model).length;
            
            if (count > 0) {
                resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> We have worked on <b>' + count + '</b> ' + brand + ' ' + model + '(s)!';
                resultDiv.style.color = 'var(--success)';
            } else {
                resultDiv.innerHTML = '<i class="fas fa-check-circle"></i> We are compatible with ' + brand + ' ' + model + '!';
                resultDiv.style.color = 'var(--primary)';
            }
             // Haptic
            if(navigator.vibrate) navigator.vibrate([30, 50, 30]);
        } else {
            resultDiv.textContent = '';
        }
    });
}



// Scroll Animation Observer (Added)
document.addEventListener('DOMContentLoaded', () => {
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        scrollObserver.observe(el);
    });
});