/**
 * checkmyresources.com - Main Application SPA Controller & Router
 * SEO Optimized & Multi-Currency (US $ / India ₹) Architecture
 */

// Defensive LocalStorage Helper
function getSavedBookmarks() {
  try {
    const item = localStorage.getItem('cmr_bookmarks');
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  try {
    localStorage.setItem('cmr_bookmarks', JSON.stringify(bookmarks));
  } catch (e) {
    // Fallback for restricted browsing
  }
}

// Dynamic SEO Update Function
function updatePageSEO(title, description) {
  if (title) {
    document.title = title;
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);
  }

  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }
}

// Application State
const state = {
  currentView: 'home',
  currentCatFilter: 'all',
  searchQuery: '',
  activeCalcId: null,
  currency: (function() {
    try {
      return localStorage.getItem('cmr_currency') || 'USD';
    } catch(e) {
      return 'USD';
    }
  })(),
  bookmarks: getSavedBookmarks()
};

// Global Error Safeguard
window.addEventListener('error', (event) => {
  console.warn('checkmyresources.com Safeguard caught notice:', event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.warn('checkmyresources.com Safeguard caught notice:', event.reason);
});

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  setAppCurrency(state.currency);
  const selectEl = document.getElementById('countryCurrencySelect');
  if (selectEl) selectEl.value = state.currency;

  initRouter();
  renderCategoriesGrid();
  renderFeaturedTools();
  renderToolsDirectory();
  initFAQAccordion();
  initSearchHandlers();
  initMobileMenu();
});

function changeCountryCurrency(curr) {
  state.currency = curr;
  try {
    localStorage.setItem('cmr_currency', curr);
  } catch (e) {}
  setAppCurrency(curr);

  // Refresh active view or calculation
  if (state.currentView === 'calculator' && state.activeCalcId) {
    openCalculatorView(state.activeCalcId);
  } else {
    showToast(`Currency updated to ${curr === 'INR' ? 'Indian Rupees (₹)' : 'US Dollars ($)'}`);
  }
}

// Router & Hash Switcher
function initRouter() {
  const handleHashChange = () => {
    try {
      const rawHash = (window.location.hash || '#home').replace('#', '') || 'home';

      if (rawHash.startsWith('calculator/')) {
        const calcId = rawHash.replace('calculator/', '');
        openCalculatorView(calcId);
      } else if (rawHash.startsWith('category/')) {
        const catId = rawHash.replace('category/', '');
        switchView('tools');
        filterCategory(catId);
      } else if (rawHash.startsWith('policy/')) {
        const secId = rawHash.replace('policy/', '');
        switchView('policy');
        setTimeout(() => scrollToPolicySection(secId), 100);
      } else {
        switchView(rawHash);
      }
    } catch (err) {
      switchView('home');
    }
  };

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();
}

function switchView(viewName) {
  state.currentView = viewName;

  const navLinks = document.getElementById('navLinks');
  if (navLinks) navLinks.classList.remove('active');

  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.remove('active');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === `#${viewName}` || (viewName === 'calculator' && href === '#tools')) {
      link.classList.add('active');
    }
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
  } else {
    const homeView = document.getElementById('view-home');
    if (homeView) homeView.classList.add('active');
  }

  // Dynamic SEO Meta Info
  switch(viewName) {
    case 'home':
      updatePageSEO(
        'checkmyresources.com | 150+ Free Financial Calculators & Planning Tools',
        'Access 150+ free financial calculators on checkmyresources.com across 21 categories. Calculate EMI, mortgage, SIP returns, income tax, retirement, stock profit, and crypto yields instantly.'
      );
      break;
    case 'tools':
      updatePageSEO(
        'Financial Tools Directory | 150+ Free Calculators - checkmyresources.com',
        'Explore our complete directory of 150+ online financial calculators for loans, investments, taxes, real estate, and crypto on checkmyresources.com.'
      );
      break;
    case 'faqs':
      updatePageSEO(
        'Frequently Asked Questions | checkmyresources.com',
        'Find answers to common questions about checkmyresources.com financial calculation formulas, client-side data privacy, and printing capabilities.'
      );
      break;
    case 'policy':
      updatePageSEO(
        'Privacy Policy & Terms of Service | checkmyresources.com',
        'Read the Privacy Policy, Terms of Service, Financial Disclaimer, and Advertising Policy for checkmyresources.com.'
      );
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   Home Page Rendering
   ========================================================================== */
function renderCategoriesGrid() {
  const grid = document.getElementById('homeCategoriesGrid');
  if (!grid) return;

  grid.innerHTML = CATEGORIES.map(cat => {
    const count = CALCULATORS_DB.filter(c => c.category === cat.id).length;
    return `
      <div class="category-card" onclick="window.location.hash='category/${cat.id}'">
        <div>
          <div class="category-name">${escapeHTML(cat.name)}</div>
          <div class="category-count">${count} Calculators</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderFeaturedTools() {
  const grid = document.getElementById('homeFeaturedGrid');
  if (!grid) return;

  const popular = CALCULATORS_DB.filter(c => c.badge === 'popular' || c.badge === 'trending').slice(0, 6);
  grid.innerHTML = popular.map(tool => createToolCardHTML(tool)).join('');
}

/* ==========================================================================
   Tools Directory & Search Engine
   ========================================================================== */
function renderToolsDirectory() {
  const container = document.getElementById('toolsDirectoryGrid');
  const countBar = document.getElementById('toolsCountDisplay');
  const pillBar = document.getElementById('categoryPillsBar');

  if (!container) return;

  if (pillBar) {
    let pillsHTML = `<button class="cat-pill ${state.currentCatFilter === 'all' ? 'active' : ''}" onclick="filterCategory('all')">All (${CALCULATORS_DB.length})</button>`;
    pillsHTML += CATEGORIES.map(cat => {
      const count = CALCULATORS_DB.filter(c => c.category === cat.id).length;
      return `<button class="cat-pill ${state.currentCatFilter === cat.id ? 'active' : ''}" onclick="filterCategory('${cat.id}')">${escapeHTML(cat.name)} (${count})</button>`;
    }).join('');
    pillBar.innerHTML = pillsHTML;
  }

  let filtered = CALCULATORS_DB;
  if (state.currentCatFilter !== 'all') {
    filtered = filtered.filter(c => c.category === state.currentCatFilter);
  }
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  if (countBar) {
    if (state.searchQuery.trim() !== '') {
      countBar.innerHTML = `Found <strong>${filtered.length}</strong> financial tools for "<em>${escapeHTML(state.searchQuery)}</em>"`;
    } else {
      countBar.innerHTML = `Showing <strong>${filtered.length}</strong> financial tools`;
    }
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
        <h3 style="font-size: 1.25rem; font-weight: 400; color: var(--text-main);">No Calculators Found</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">We couldn't find any tool matching "${escapeHTML(state.searchQuery)}".</p>
        <button class="cat-pill active" style="margin-top: 1.25rem;" onclick="resetToolsFilters()">Clear Search & Filters</button>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(tool => createToolCardHTML(tool)).join('');
  }
}

function createToolCardHTML(tool) {
  const isBookmarked = state.bookmarks.includes(tool.id);
  const catObj = CATEGORIES.find(c => c.id === tool.category) || { name: 'Finance' };

  return `
    <div class="tool-card">
      ${tool.badge ? `<span class="tool-badge badge-${tool.badge}">${escapeHTML(tool.badge)}</span>` : ''}
      <div>
        <h3 class="tool-title">${escapeHTML(tool.name)}</h3>
        <span class="tool-cat-tag">${escapeHTML(catObj.name)}</span>
        <p class="tool-desc">${escapeHTML(tool.description)}</p>
      </div>
      <div class="tool-card-footer">
        <button class="btn-open-tool" onclick="window.location.hash='calculator/${tool.id}'">
          Open Calculator &rarr;
        </button>
        <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" onclick="toggleBookmark('${tool.id}', event)" title="Bookmark Tool">
          &#9733;
        </button>
      </div>
    </div>
  `;
}

function filterCategory(catId) {
  state.currentCatFilter = catId;
  renderToolsDirectory();
}

function resetToolsFilters() {
  state.currentCatFilter = 'all';
  state.searchQuery = '';
  document.querySelectorAll('.hero-search-input').forEach(input => input.value = '');
  renderToolsDirectory();
}

function initSearchHandlers() {
  document.querySelectorAll('.hero-search-input').forEach(input => {
    input.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      document.querySelectorAll('.hero-search-input').forEach(inp => {
        if (inp !== e.target) inp.value = e.target.value;
      });

      if (state.currentView !== 'tools') {
        switchView('tools');
      }
      renderToolsDirectory();
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        state.searchQuery = e.target.value;
        switchView('tools');
        renderToolsDirectory();
        const grid = document.getElementById('toolsDirectoryGrid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   Policy Page Sub-Navigation
   ========================================================================== */
function scrollToPolicySection(secId) {
  const targetSec = document.getElementById(`policy-${secId}`);
  if (targetSec) {
    targetSec.scrollIntoView({ behavior: 'smooth' });
  }

  document.querySelectorAll('.policy-nav-btn').forEach(btn => {
    btn.classList.remove('active');
    const attr = btn.getAttribute('onclick') || '';
    if (attr.includes(secId)) {
      btn.classList.add('active');
    }
  });
}

/* ==========================================================================
   Interactive Calculator View with Dynamic Currency Support
   ========================================================================== */
function openCalculatorView(calcId) {
  const calc = CALCULATORS_DB.find(c => c.id === calcId);
  if (!calc) {
    switchView('tools');
    return;
  }

  state.activeCalcId = calcId;
  switchView('calculator');

  // Update Calculator Specific SEO
  updatePageSEO(
    `${calc.name} - Free Online Calculator | checkmyresources.com`,
    `Calculate ${calc.name} easily on checkmyresources.com with instant formulas, breakdown charts, and formatted results. ${calc.description}`
  );

  const container = document.getElementById('calculatorContentArea');
  if (!container) return;

  const catObj = CATEGORIES.find(c => c.id === calc.category) || { name: 'Financial Tool' };
  const currSym = getCurrencySymbol();

  const formFieldsHTML = calc.fields.map(field => {
    let prefixDisp = field.prefix;
    if (prefixDisp === '$' || prefixDisp === '₹') {
      prefixDisp = currSym;
    }

    return `
      <div class="calc-form-group">
        <div class="calc-label-row">
          <label class="calc-label" for="input_${field.id}">${escapeHTML(field.label)}</label>
          <span class="calc-unit-suffix" id="val_display_${field.id}">${prefixDisp || ''}${field.default}${field.suffix || ''}</span>
        </div>
        <div class="calc-input-box">
          ${prefixDisp ? `<span class="calc-unit-prefix">${prefixDisp}</span>` : ''}
          <input 
            type="${field.type}" 
            id="input_${field.id}" 
            class="calc-number-input" 
            value="${field.default}"
            min="${field.min || 0}" 
            max="${field.max || 10000000}" 
            step="${field.step || 1}"
            oninput="syncSliderInput('${field.id}', this.value)"
          />
          ${field.suffix ? `<span class="calc-unit-suffix">${field.suffix}</span>` : ''}
        </div>
        <input 
          type="range" 
          id="slider_${field.id}" 
          class="calc-range-slider" 
          value="${field.default}" 
          min="${field.min || 0}" 
          max="${field.max || 10000000}" 
          step="${field.step || 1}"
          oninput="syncNumberInput('${field.id}', this.value)"
        />
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="calc-page-header">
      <button class="btn-back-tools" onclick="window.location.hash='tools'">
        &larr; Back to Tools Directory
      </button>
      <button class="btn-bookmark ${state.bookmarks.includes(calc.id) ? 'bookmarked' : ''}" onclick="toggleBookmark('${calc.id}', event)">
        ${state.bookmarks.includes(calc.id) ? 'Saved' : 'Save Tool'}
      </button>
    </div>

    <div class="calc-layout-grid">
      <div class="calc-card">
        <div class="calc-title-area">
          <h2 class="calc-title">${escapeHTML(calc.name)}</h2>
          <div style="font-size: 0.775rem; font-weight: 400; color: var(--blue-primary); text-transform: uppercase; margin-top: 0.15rem;">${escapeHTML(catObj.name)}</div>
          <p class="calc-desc">${escapeHTML(calc.description)}</p>
        </div>

        <form id="calcForm" onsubmit="event.preventDefault();">
          ${formFieldsHTML}
        </form>

        ${calc.formula ? `
          <div class="formula-info-box">
            <div class="formula-title">Applied Formula:</div>
            <div class="formula-text">${escapeHTML(calc.formula)}</div>
          </div>
        ` : ''}
      </div>

      <div class="results-card">
        <div>
          <div class="primary-result-box">
            <div class="primary-result-label" id="primaryResultLabel">Calculated Metric</div>
            <div class="primary-result-value" id="primaryResultValue">${currSym}0.00</div>
          </div>

          <div class="results-metrics-grid" id="metricsContainer">
            <!-- Dynamic Mini Metric Cards -->
          </div>

          <div class="chart-container">
            <canvas id="calcDonutChart"></canvas>
          </div>
        </div>

        <div class="tool-action-bar">
          <button class="btn-tool-action btn-action-primary" onclick="copyShareLink()">
            Share Calculation
          </button>
          <button class="btn-tool-action btn-action-secondary" onclick="window.print()">
            Print Summary
          </button>
        </div>
      </div>
    </div>
  `;

  executeActiveCalculation();
}

function syncNumberInput(fieldId, val) {
  const input = document.getElementById(`input_${fieldId}`);
  if (input) input.value = val;
  executeActiveCalculation();
}

function syncSliderInput(fieldId, val) {
  const slider = document.getElementById(`slider_${fieldId}`);
  if (slider) slider.value = val;
  executeActiveCalculation();
}

function executeActiveCalculation() {
  if (!state.activeCalcId) return;
  const calc = CALCULATORS_DB.find(c => c.id === state.activeCalcId);
  if (!calc) return;

  const currSym = getCurrencySymbol();
  const locale = state.currency === 'INR' ? 'en-IN' : 'en-US';

  const inputValues = {};
  calc.fields.forEach(field => {
    const el = document.getElementById(`input_${field.id}`);
    const rawVal = el ? parseFloat(el.value) : field.default;
    inputValues[field.id] = isNaN(rawVal) ? 0 : rawVal;

    let prefixDisp = field.prefix;
    if (prefixDisp === '$' || prefixDisp === '₹') {
      prefixDisp = currSym;
    }

    const valDisp = document.getElementById(`val_display_${field.id}`);
    if (valDisp) {
      valDisp.textContent = `${prefixDisp || ''}${Number(inputValues[field.id]).toLocaleString(locale)}${field.suffix || ''}`;
    }
  });

  try {
    const res = calc.calculate(inputValues);

    const pLabel = document.getElementById('primaryResultLabel');
    const pValue = document.getElementById('primaryResultValue');
    if (pLabel) pLabel.textContent = res.primary.label;
    if (pValue) pValue.textContent = res.primary.value;

    const metricsBox = document.getElementById('metricsContainer');
    if (metricsBox && res.metrics) {
      metricsBox.innerHTML = res.metrics.map(m => `
        <div class="metric-mini-card">
          <div class="metric-mini-label">${escapeHTML(m.label)}</div>
          <div class="metric-mini-value">${escapeHTML(m.value)}</div>
        </div>
      `).join('');
    }

    if (res.chartData) {
      renderDonutChart('calcDonutChart', res.chartData.labels, res.chartData.values, res.chartData.colors);
    }
  } catch (err) {
    console.warn('Calculation safeguard:', err);
  }
}

/* ==========================================================================
   Mobile Menu & Utilities
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

function initFAQAccordion() {
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.parentElement;
      if (faqItem) faqItem.classList.toggle('active');
    });
  });
}

function toggleBookmark(calcId, e) {
  if (e) e.stopPropagation();
  const idx = state.bookmarks.indexOf(calcId);
  if (idx > -1) {
    state.bookmarks.splice(idx, 1);
    showToast('Removed from saved tools');
  } else {
    state.bookmarks.push(calcId);
    showToast('Saved to your bookmarks');
  }
  saveBookmarks(state.bookmarks);

  if (state.currentView === 'tools') renderToolsDirectory();
  if (state.currentView === 'home') renderFeaturedTools();
}

function showToast(msg) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function copyShareLink() {
  try {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard!');
  } catch (e) {
    showToast('Link ready in address bar');
  }
}

function escapeHTML(str) {
  if (typeof str !== 'string') return String(str || '');
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
