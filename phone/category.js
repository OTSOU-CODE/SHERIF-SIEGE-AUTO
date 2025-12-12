document.addEventListener('DOMContentLoaded', () => {
    const vehiclesGrid = document.getElementById('vehiclesGrid');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const pagination = document.getElementById('pagination');

    // Dropdown Elements
    const brandDropdown = {
        trigger: document.getElementById('brandTrigger'),
        menu: document.getElementById('brandMenu'),
        selectedText: document.getElementById('selectedBrand'),
        container: document.getElementById('brandDropdown')
    };

    const yearDropdown = {
        trigger: document.getElementById('yearTrigger'),
        menu: document.getElementById('yearMenu'),
        selectedText: document.getElementById('selectedYear'),
        container: document.getElementById('yearDropdown')
    };

    // Verify critical elements exist
    if (!vehiclesGrid || !loading || !searchInput) {
        console.error('Critical elements missing from DOM');
        return;
    }

    // Responsive Search Placeholder
    function updateSearchPlaceholder() {
        if (window.innerWidth < 768) {
            searchInput.placeholder = "Search brand, model, year...";
        } else {
            searchInput.placeholder = "Search brand, model, or year... (e.g. Toyota Camry)";
        }
    }

    updateSearchPlaceholder();
    window.addEventListener('resize', updateSearchPlaceholder);

    let allData = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = 24;
    let activeBrand = '';
    let activeYear = '';

    // Brand Icon Mapping
    const brandIcons = {
        'toyota': 'fa-car',
        'honda': 'fa-car-side',
        'bmw': 'fa-circle',
        'mercedes': 'fa-star',
        'audi': 'fa-ring',
        'ford': 'fa-truck-pickup',
        'chevrolet': 'fa-plus',
        'nissan': 'fa-circle-notch',
        'hyundai': 'fa-italic',
        'kia': 'fa-k',
        'volkswagen': 'fa-v',
        'mazda': 'fa-m',
        'subaru': 'fa-star-of-life',
        'lexus': 'fa-l',
        'jeep': 'fa-mountain',
        'dodge': 'fa-bolt',
        'ram': 'fa-sheep',
        'gmc': 'fa-truck',
        'cadillac': 'fa-shield-alt',
        'buick': 'fa-shield-alt',
        'acura': 'fa-a',
        'infiniti': 'fa-infinity',
        'lincoln': 'fa-star',
        'volvo': 'fa-arrow-circle-up',
        'land rover': 'fa-compass',
        'jaguar': 'fa-cat',
        'porsche': 'fa-horse',
        'mini': 'fa-car-compact',
        'mitsubishi': 'fa-shapes',
        'tesla': 'fa-bolt',
        'fiat': 'fa-f',
        'alfa romeo': 'fa-cross',
        'genesis': 'fa-wing',
        'chrysler': 'fa-copyright'
    };

    function getBrandIcon(brand) {
        return brandIcons[brand.toLowerCase()] || 'fa-car';
    }

    // Debounce Function
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

    // Fetch and parse CSV data
    // Fetch and parse CSV data
    const csvPath = '../DATA/vehicles.csv';

    fetch(csvPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            allData = parseCSV(csvText);
            console.log(`Loaded ${allData.length} vehicles`);
            initializeFilters(allData);
            filteredData = allData;
            loading.style.display = 'none';
            renderGrid();
            renderPagination();
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
            loading.innerHTML = `
                <div class="empty-state error-state">
                    <i class="fas fa-exclamation-circle empty-icon"></i>
                    <h3>Error Loading Data</h3>
                    <p>Could not load vehicle database.</p>
                    <p class="error-details">${error.message}</p>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                </div>
            `;
        });

    function parseCSV(text) {
        const lines = text.split('\n');
        const data = [];
        // Skip header (index 0)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const columns = line.split(',');
                if (columns.length >= 3) {
                    data.push({
                        brand: columns[0].trim(),
                        model: columns[1].trim(),
                        year: columns[2].trim(),
                        created: columns[3] ? columns[3].trim() : ''
                    });
                }
            }
        }
        return data;
    }

    function initializeFilters(data) {
        // Unique Brands
        const brands = [...new Set(data.map(item => item.brand))].sort();
        populateDropdown(brandDropdown, brands, 'Brand');

        // Unique Years (Sorted Descending)
        const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
        populateDropdown(yearDropdown, years, 'Year');
    }

    function populateDropdown(dropdownObj, items, type) {
        const { menu, selectedText, trigger, container } = dropdownObj;

        if (!menu || !selectedText || !trigger || !container) {
            console.warn(`Dropdown elements missing for ${type}`);
            return;
        }

        // Clear existing (keep first "All" option)
        menu.innerHTML = `<div class="dropdown-item active" data-value="">All ${type}s</div>`;

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.dataset.value = item;
            div.innerHTML = `
                <span>${item}</span>
            `;
            menu.appendChild(div);
        });

        // Event Listeners
        trigger.onclick = (e) => {
            e.stopPropagation();
            const wasOpen = menu.classList.contains('open');

            // Close all dropdowns (including this one)
            closeAllDropdowns(null);

            // If it wasn't open, open it
            if (!wasOpen) {
                menu.classList.add('open');
                trigger.classList.add('active');
            }
        };

        // Item Selection
        menu.querySelectorAll('.dropdown-item').forEach(item => {
            item.onclick = (e) => {
                e.stopPropagation();

                // Update Active State
                menu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Update Text
                const value = item.dataset.value;
                selectedText.textContent = value || `All ${type}s`;

                // Update Filter State
                if (type === 'Brand') activeBrand = value;
                if (type === 'Year') activeYear = value;

                // Close Menu
                menu.classList.remove('open');
                trigger.classList.remove('active');

                // Trigger Filter
                filterData();
            };
        });
    }

    function closeAllDropdowns(exceptContainer) {
        [brandDropdown, yearDropdown].forEach(d => {
            if (d.container !== exceptContainer) {
                d.menu.classList.remove('open');
                d.trigger.classList.remove('active');
            }
        });
    }

    document.addEventListener('click', () => closeAllDropdowns(null));

    function filterData() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        filteredData = allData.filter(item => {
            // Combine fields for smarter search (e.g. allows "Toyota Camry" or "Civic 2020")
            const itemSearchString = `${item.brand} ${item.model} ${item.year}`.toLowerCase();
            const matchesSearch = !searchTerm || itemSearchString.includes(searchTerm);

            const matchesBrand = !activeBrand || item.brand === activeBrand;
            const matchesYear = !activeYear || item.year === activeYear;

            return matchesSearch && matchesBrand && matchesYear;
        });

        currentPage = 1;
        renderGrid();
        renderPagination();
    }

    function renderGrid() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredData.slice(start, end);
        const searchTerm = searchInput.value.trim();

        vehiclesGrid.innerHTML = '';

        if (pageData.length === 0) {
            vehiclesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search empty-icon"></i>
                    <h3>No vehicles found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();

        pageData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'vehicle-card';
            card.style.animationDelay = `${index * 0.03}s`; // Faster stagger

            const brandIcon = getBrandIcon(item.brand);
            const highlightedModel = highlightText(item.model, searchTerm);

            card.innerHTML = `
                <div class="card-header">
                    <div class="brand-badge" title="${escapeHtml(item.brand)}">
                        <i class="fas ${brandIcon}"></i>
                    </div>
                    <span class="year-badge">${escapeHtml(item.year)}</span>
                </div>
                <h3 class="model-name">${highlightedModel}</h3>
                <div class="card-footer">
                    <button class="view-btn" onclick="location.href='index.html#contact'">
                        Reserve <i class="fas fa-check-circle"></i>
                    </button>
                </div>
            `;
            fragment.appendChild(card);
        });

        vehiclesGrid.appendChild(fragment);
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm) return escapeHtml(text);
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return escapeHtml(text).replace(regex, '<span class="highlight">$1</span>');
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        const createBtn = (page, content, isDisabled = false, isActive = false) => {
            const btn = document.createElement('button');
            btn.className = `page-btn ${isActive ? 'active' : ''}`;
            btn.innerHTML = content;
            btn.disabled = isDisabled;
            if (!isDisabled) {
                btn.onclick = () => {
                    currentPage = page;
                    renderGrid();
                    renderPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };
            }
            return btn;
        };

        // Prev
        pagination.appendChild(createBtn(currentPage - 1, '<i class="fas fa-chevron-left"></i>', currentPage === 1));

        // Pages
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        if (startPage > 1) {
            pagination.appendChild(createBtn(1, '1'));
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.alignSelf = 'center';
                dots.style.color = 'var(--text-secondary)';
                pagination.appendChild(dots);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createBtn(i, i, false, i === currentPage));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.alignSelf = 'center';
                dots.style.color = 'var(--text-secondary)';
                pagination.appendChild(dots);
            }
            pagination.appendChild(createBtn(totalPages, totalPages));
        }

        // Next
        pagination.appendChild(createBtn(currentPage + 1, '<i class="fas fa-chevron-right"></i>', currentPage === totalPages));
    }

    // Sticky Search Bar Logic
    const stickyWrapper = document.getElementById('stickySearchWrapper');
    if (stickyWrapper) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                stickyWrapper.classList.add('scrolled');
            } else {
                stickyWrapper.classList.remove('scrolled');
            }
        });
    }

    // Filter Sidebar Logic
    const filterSidebar = document.getElementById('filterSidebar');
    const filterOverlay = document.getElementById('filterOverlay');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const sidebarPlaceholder = document.createComment('sidebar-placeholder');

    function toggleFilterSidebar() {
        const isOpen = filterSidebar.classList.contains('open');
        const isMobile = window.innerWidth < 1024;

        if (!isOpen) {
            // Opening
            if (isMobile) {
                // Move sidebar to body to avoid stacking context issues with sticky parent
                if (filterSidebar.parentNode) {
                    filterSidebar.parentNode.insertBefore(sidebarPlaceholder, filterSidebar);
                    document.body.appendChild(filterSidebar);
                }
            }

            filterOverlay.classList.add('active');
            // Small delay to ensure DOM move is registered before anim starts
            requestAnimationFrame(() => {
                filterSidebar.classList.add('open');
            });

        } else {
            // Closing
            filterSidebar.classList.remove('open');
            filterOverlay.classList.remove('active');

            // Wait for transition to finish before moving back
            setTimeout(() => {
                if (isMobile && document.body.contains(filterSidebar)) {
                    if (sidebarPlaceholder.parentNode) {
                        sidebarPlaceholder.parentNode.insertBefore(filterSidebar, sidebarPlaceholder);
                        sidebarPlaceholder.parentNode.removeChild(sidebarPlaceholder);
                    } else {
                        // Fallback: put back in sticky wrapper
                        const sticky = document.getElementById('stickySearchWrapper');
                        if (sticky) sticky.appendChild(filterSidebar);
                    }
                }
            }, 400);
        }
    }

    if (filterToggleBtn) filterToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterSidebar();
    });

    if (closeFilterBtn) closeFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFilterSidebar();
    });

    if (filterOverlay) filterOverlay.addEventListener('click', toggleFilterSidebar);

    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => {
        toggleFilterSidebar();
        filterData();
    });

    // Auto-complete Logic
    const autocompleteSuggestions = document.getElementById('autocompleteSuggestions');

    function getSuggestions(query) {
        const seen = new Set();
        return allData.filter(item => {
            const text = `${item.brand} ${item.model}`.toLowerCase();
            if (text.includes(query) && !seen.has(text)) {
                seen.add(text);
                return true;
            }
            return false;
        }).slice(0, 5);
    }

    function renderSuggestions(suggestions) {
        if (suggestions.length === 0) {
            autocompleteSuggestions.classList.remove('active');
            return;
        }
        autocompleteSuggestions.innerHTML = suggestions.map(item => `
            <div class="suggestion-item">
                <i class="fas ${getBrandIcon(item.brand)} suggestion-icon"></i>
                <span>${item.brand} ${item.model}</span>
            </div>
        `).join('');

        autocompleteSuggestions.classList.add('active');

        // Add click listeners to new items
        autocompleteSuggestions.querySelectorAll('.suggestion-item').forEach((el, index) => {
            el.addEventListener('click', () => {
                const item = suggestions[index];
                searchInput.value = `${item.brand} ${item.model}`;
                autocompleteSuggestions.classList.remove('active');
                filterData();
            });
        });
    }

    // Search Debounce & Autocomplete
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.toLowerCase().trim();

        if (query.length > 1) {
            const suggestions = getSuggestions(query);
            renderSuggestions(suggestions);
        } else {
            autocompleteSuggestions.classList.remove('active');
        }

        // Live filtering removed to allow explicit search button click
        // filterData(); 
    }, 300));

    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !autocompleteSuggestions.contains(e.target)) {
            autocompleteSuggestions.classList.remove('active');
        }
    });

    // Search Focus Mode
    searchInput.addEventListener('focus', () => {
        document.body.classList.add('search-focus-mode');
    });

    searchInput.addEventListener('blur', (e) => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            if (!searchInput.value.trim()) {
                document.body.classList.remove('search-focus-mode');
            }
        }, 200);
    });

    // Handle Search Icon Click & Enter Key
    const searchIcon = document.querySelector('.search-input-group .search-icon');

    function scrollToResults() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            filterData();
            document.body.classList.add('search-focus-mode');
            searchInput.blur();
            setTimeout(scrollToResults, 100);
        });
    }

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.body.classList.add('search-focus-mode');
            searchInput.blur();
            autocompleteSuggestions.classList.remove('active');
            setTimeout(scrollToResults, 300);
        }
    });
});
