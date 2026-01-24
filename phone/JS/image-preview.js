// Mobile PDP JavaScript - Sherif Siege Auto

// Gallery data
const galleryData = [
  {
    src: 'images/Gallery/Black-&-Orange.png',
    title: 'Premium Black & Orange',
    description: 'Sporty two-tone upholstery with vibrant orange accents. Perfect for those who want to stand out.',
    colorCode: 'linear-gradient(135deg, #000000 50%, #FF4500 50%)',
    variants: [
      { src: 'images/Gallery/Black-&-Orange.png', title: 'Main View' },
      { src: 'images/Image Variaant/Black-&-Orange-1.png', title: 'Side View' },
      { src: 'images/Image Variaant/Black-&-Orange-2.png', title: 'Detail View' },
      { src: 'images/Image Variaant/Black-&-Orange-3.png', title: 'Back View' },
      { src: 'images/Image Variaant/Black-&-Orange-4.png', title: 'Interior View' }
    ]
  },
  {
    src: 'images/Gallery/Blue.png',
    title: 'Elegant Blue Style',
    description: 'Sophisticated blue leather design. Adds a touch of class and calm to your interior.',
    colorCode: '#1E3A8A',
    variants: [
      { src: 'images/Gallery/Blue.png', title: 'Main View' }
    ]
  },
  {
    src: 'images/Gallery/Red.png',
    title: 'Classic Red Design',
    description: 'Rich red leather interior with premium stitching. A bold choice for a bold driver.',
    colorCode: '#DC2626',
    variants: [
      { src: 'images/Gallery/Red.png', title: 'Main View' }
    ]
  },
  {
    src: 'images/Gallery/Dark-blue-&-white.png',
    title: 'Modern Dark Blue & White',
    description: 'Bold contrast with exceptional craftsmanship. Creates a bright and airy feel inside.',
    colorCode: 'linear-gradient(135deg, #1E3A8A 50%, #FFFFFF 50%)',
    variants: [
      { src: 'images/Gallery/Dark-blue-&-white.png', title: 'Main View' },
      { src: 'images/Image Variaant/Dark-blue-&-white-1.png', title: 'Side View' },
      { src: 'images/Image Variaant/Dark-blue-&-white-2.png', title: 'Detail View' },
      { src: 'images/Image Variaant/Dark-blue-&-white-2 (2).png', title: 'Back View' },
      { src: 'images/Image Variaant/Dark-blue-&-white4.png', title: 'Interior View' }
    ]
  },
  {
    src: 'images/Gallery/Black-&-Red.png',
    title: 'Sporty Black & Red',
    description: 'Dynamic black and red leather combination. Racing inspired aesthetics for your daily drive.',
    colorCode: 'linear-gradient(135deg, #000000 50%, #DC2626 50%)',
    variants: [
      { src: 'images/Gallery/Black-&-Red.png', title: 'Main View' },
      { src: 'images/Image Variaant/Black-&-Red-1.png', title: 'Side View' },
      { src: 'images/Image Variaant/Black-&-Red-2.png', title: 'Detail View' },
      { src: 'images/Image Variaant/Black-&-Red-3.png', title: 'Back View' },
      { src: 'images/Image Variaant/Black-&-Red-4.png', title: 'Interior View' }
    ]
  }
];

let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function () {
  initPDP();
});

function initPDP() {
  const urlParams = new URLSearchParams(window.location.search);
  currentImageIndex = parseInt(urlParams.get('index')) || 0;

  if (currentImageIndex < 0 || currentImageIndex >= galleryData.length) {
    currentImageIndex = 0;
  }

  const product = galleryData[currentImageIndex];
  renderProduct(product);
  renderColorVariants();
}

function renderProduct(product) {
  // 1. Populate Text Info
  document.getElementById('product-title').textContent = product.title;

  const descriptionEl = document.getElementById('product-description');
  if (descriptionEl) {
    descriptionEl.textContent = product.description || 'Premium quality upholstery with exceptional attention to detail.';
  }

  // 2. Setup Gallery
  const galleryScroll = document.getElementById('galleryScroll');
  const galleryDots = document.getElementById('galleryDots');

  if (galleryScroll && galleryDots) {
    galleryScroll.innerHTML = '';
    galleryDots.innerHTML = '';

    const variants = product.variants || [{ src: product.src }];

    variants.forEach((variant, index) => {
      // Image
      const img = document.createElement('img');
      img.src = variant.src;
      img.className = 'gallery-img';
      img.alt = variant.title || product.title;
      galleryScroll.appendChild(img);

      // Dot
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      galleryDots.appendChild(dot);
    });

    // 3. Setup Scroll Listener for Dots
    galleryScroll.onscroll = () => {
      const scrollLeft = galleryScroll.scrollLeft;
      const width = galleryScroll.offsetWidth;
      const index = Math.round(scrollLeft / width);

      const dots = document.querySelectorAll('.dot');
      dots.forEach(dot => dot.classList.remove('active'));
      if (dots[index]) dots[index].classList.add('active');
    };
  }
}

function renderColorVariants() {
  // Find the container specifically for colors. 
  // We look for the section title "Select Color" and get its next sibling.
  const sectionTitles = document.querySelectorAll('.section-title');
  let colorContainer = null;

  sectionTitles.forEach(title => {
    if (title.textContent.trim().toLowerCase() === 'select color') {
      colorContainer = title.nextElementSibling;
    }
  });

  if (colorContainer && colorContainer.classList.contains('variant-scroll')) {
    colorContainer.innerHTML = '';

    galleryData.forEach((item, index) => {
      const circle = document.createElement('div');
      circle.className = `color-circle ${index === currentImageIndex ? 'selected' : ''}`;
      circle.style.background = item.colorCode || '#ccc';
      circle.onclick = () => switchProduct(index);
      colorContainer.appendChild(circle);
    });
  }
}

function switchProduct(index) {
  if (index < 0 || index >= galleryData.length) return;

  currentImageIndex = index;
  const product = galleryData[currentImageIndex];

  // Update URL without reloading
  const newUrl = new URL(window.location);
  newUrl.searchParams.set('index', index);
  window.history.pushState({}, '', newUrl);

  renderProduct(product);
  renderColorVariants(); // Re-render to update selected state
}

/* --- Selectors Logic --- */
function selectChip(el) {
  // Simple visual selection for chips
  const parent = el.parentElement;
  if (parent) {
    parent.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }
}

/* --- Quantity Logic --- */
let qty = 1;
function updateQty(change) {
  if (qty + change > 0) {
    qty += change;
    const qtyNum = document.getElementById('qtyNum');
    if (qtyNum) qtyNum.innerText = qty;
  }
}

function addToCart() {
  const btn = document.querySelector('.add-btn');
  if (!btn) return;

  const originalContent = btn.innerHTML;
  const originalBg = btn.style.background;

  btn.innerHTML = '<i class="fas fa-check"></i> Added';
  btn.style.background = '#10b981'; // Success green

  setTimeout(() => {
    btn.innerHTML = originalContent;
    btn.style.background = originalBg;
  }, 1500);
}
