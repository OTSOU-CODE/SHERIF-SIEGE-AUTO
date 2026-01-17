/**
 * creates and mounts the Tubelight Navbar
 * @param {Object} options
 * @param {Array} options.items - Array of objects { name, url, icon }
 * @param {HTMLElement} options.target - Element to append the navbar to (default document.body)
 */
export function createTubelightNavbar({ items, target = document.body, logo = '' }) {
    // Container
    const navbar = document.createElement('div');
    navbar.className = 'tubelight-navbar';
  
    // 1. Logo (if provided)
    if (logo) {
      const logoWrapper = document.createElement('div');
      logoWrapper.className = 'tubelight-logo';
      logoWrapper.innerHTML = logo;
      navbar.appendChild(logoWrapper);
    }
  
    const container = document.createElement('div');
    container.className = 'tubelight-navbar-container';
    navbar.appendChild(container);
  
    // Lamp (Active Background)
    const lamp = document.createElement('div');
    lamp.className = 'tubelight-lamp';
    // Lamp Glow Structure
    const lampGlow = document.createElement('div');
    lampGlow.className = 'tubelight-lamp-glow';
    lamp.appendChild(lampGlow);
    const lampSpot = document.createElement('div');
    lampSpot.className = 'tubelight-lamp-spot';
    lampGlow.appendChild(lampSpot); 
    
    container.appendChild(lamp);
    
    // Create/Render Items
    let activeTab = items[0].name;

    // Auto-detect active tab based on URL
    try {
        const currentUrl = window.location.href;
        const matchingItem = items.find(item => {
             // Handle absolute/relative comparisons simply by checking if the URL ends with the item.url
             // or if the item.url is just a hash and the hash matches
             if (item.url.startsWith('#')) return window.location.hash === item.url;
             return currentUrl.includes(item.url);
        });
        if (matchingItem) {
             activeTab = matchingItem.name;
        }
    } catch (e) {
        console.warn('Unable to auto-detect active tab', e);
    }

    const itemElements = [];
  
    items.forEach((item) => {
      const link = document.createElement('a');
      link.href = item.url;
      link.className = `tubelight-nav-item ${item.name === activeTab ? 'active' : ''}`;
      link.dataset.name = item.name;
      
      // Icon (handled via Lucide 'data-lucide' attribute or innerHTML if we pass SVG strings)
      // Since we don't not have a react compiler, we expect 'icon' to be the Icon NAME string (e.g. "home")
      // so we can use lucide.createIcons() or <i data-lucide="...">
      
      const iconWrapper = document.createElement('span');
      iconWrapper.className = 'icon-wrapper';
      const iconElement = document.createElement('i');
      iconElement.setAttribute('data-lucide', item.icon);
      iconWrapper.appendChild(iconElement);
      
      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = item.name;
      
      link.appendChild(label);
      link.appendChild(iconWrapper);
      
      link.addEventListener('click', (e) => {
        // e.preventDefault(); // Optional: depend on if we want actual navigation
        setActive(item.name);
      });
      
      container.appendChild(link);
      itemElements.push(link);
    });
  
    target.appendChild(navbar);
  
    // Initialize standard Lucide icons if available globally
    if (window.lucide) {
      window.lucide.createIcons();
    }
  
    // Logic to move the lamp
    function setActive(name) {
      activeTab = name;
      
      // Update active class
      itemElements.forEach(el => {
        if (el.dataset.name === name) {
          el.classList.add('active');
          moveLampTo(el);
        } else {
          el.classList.remove('active');
        }
      });
    }
  
    function moveLampTo(element) {
        // Get relative position
        const containerRect = container.getBoundingClientRect();
        const itemRect = element.getBoundingClientRect();
        
        const left = itemRect.left - containerRect.left;
        const width = itemRect.width;
        
        lamp.style.width = `${width}px`;
        lamp.style.transform = `translateX(${left}px)`;
        // If we want it to 'fade in' initially, we could handle that but simple slide is fine.
    }
  
    // Initial position
    setTimeout(() => {
        const activeEl = itemElements.find(el => el.dataset.name === activeTab);
        if (activeEl) moveLampTo(activeEl);
    }, 100); // Small delay to ensure rendering
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
         const activeEl = itemElements.find(el => el.dataset.name === activeTab);
         if (activeEl) moveLampTo(activeEl);
    });

    // Smart Navbar (Hide on scroll down, show on scroll up)
    let lastScrollTop = 0;
    const scrollThreshold = 100; // Minimum scroll amount before hiding

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      // Don't hide if we're near the top
      if (currentScroll < scrollThreshold) {
        navbar.classList.remove('navbar-hidden');
        lastScrollTop = currentScroll;
        return;
      }

      if (currentScroll > lastScrollTop) {
        // Scrolling Down
        navbar.classList.add('navbar-hidden');
      } else {
        // Scrolling Up
        navbar.classList.remove('navbar-hidden');
      }
      
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    });
  
    return navbar;
  }
