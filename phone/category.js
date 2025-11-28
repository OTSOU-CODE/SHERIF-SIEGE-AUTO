document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('tableBody');
    const loading = document.getElementById('loading');
    const table = document.getElementById('vehiclesTable');
    const searchInput = document.getElementById('searchInput');
    const pagination = document.getElementById('pagination');

    let allData = [];
    let filteredData = [];
    let currentPage = 1;
    const itemsPerPage = 20;

    // Fetch and parse CSV data
    fetch('../DATA/all-vehicles-model - Copy.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csvText => {
            allData = parseCSV(csvText);
            filteredData = allData;
            loading.style.display = 'none';
            table.style.display = 'table';
            renderTable();
            renderPagination();
        })
        .catch(error => {
            console.error('Error loading CSV:', error);
            loading.innerHTML = '<p style="color: var(--error);">Error loading data. Please try again later.</p>';
        });

    // Simple CSV Parser
    function parseCSV(text) {
        const lines = text.split('\n');
        const data = [];
        // Skip header (index 0) and start from 1
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // Handle potential quotes in CSV if needed, but simple split for now based on sample
                // The sample showed simple comma separation: Brand,Model,Year,Created On,Modified On
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

    // Render Table
    function renderTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filteredData.slice(start, end);

        tableBody.innerHTML = '';

        if (pageData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No results found</td></tr>';
            return;
        }

        pageData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(item.brand)}</td>
                <td>${escapeHtml(item.model)}</td>
                <td>${escapeHtml(item.year)}</td>
                <td class="hide-mobile">${escapeHtml(item.created)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Render Pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'page-btn';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        pagination.appendChild(prevBtn);

        // Page Numbers logic (show limited window)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        if (startPage > 1) {
            const firstPageBtn = createPageBtn(1);
            pagination.appendChild(firstPageBtn);
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.alignSelf = 'center';
                pagination.appendChild(dots);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination.appendChild(createPageBtn(i));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.style.alignSelf = 'center';
                pagination.appendChild(dots);
            }
            pagination.appendChild(createPageBtn(totalPages));
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'page-btn';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        pagination.appendChild(nextBtn);
    }

    function createPageBtn(pageNum) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${pageNum === currentPage ? 'active' : ''}`;
        btn.textContent = pageNum;
        btn.onclick = () => {
            currentPage = pageNum;
            renderTable();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        return btn;
    }

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredData = allData.filter(item =>
            item.brand.toLowerCase().includes(searchTerm) ||
            item.model.toLowerCase().includes(searchTerm) ||
            item.year.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        renderTable();
        renderPagination();
    });

    // Helper to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
