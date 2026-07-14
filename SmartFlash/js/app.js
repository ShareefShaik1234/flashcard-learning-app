/* ==========================================================================
   SMARTFLASH GLOBAL ENGINE (app.js)
   Description: Manages localStorage DB, dynamic layout generation,
                dark/light themes, and global toast notifications.
   ========================================================================== */

// --- Database Configuration & Fallbacks ---
const DB_CARDS_KEY = 'smartflash_cards';
const DB_STATS_KEY = 'smartflash_stats';

// Default Computer Science mock data for a fully functional boot
const DEFAULT_FLASHCARDS = [
  {
    id: '1717660000001',
    question: 'What is the Big O time complexity of searching in a Balanced Binary Search Tree (BST)?',
    answer: 'O(log n) because the search space is halved at each step of the tree traversal.',
    category: 'Algorithms',
    isLearned: false,
    isDifficult: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '1717660000002',
    question: "Explain the difference between '==' and '===' in JavaScript.",
    answer: "'==' checks for value equality after performing type coercion, while '===' checks for strict equality (both value and type must match without coercion).",
    category: 'Web Dev',
    isLearned: false,
    isDifficult: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '1717660000003',
    question: 'What are the four pillars of Object-Oriented Programming (OOP)?',
    answer: 'Encapsulation, Inheritance, Polymorphism, and Abstraction.',
    category: 'OOP',
    isLearned: false,
    isDifficult: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '1717660000004',
    question: 'What is the purpose of the virtual DOM in modern frontend frameworks?',
    answer: 'It keeps a lightweight representation of the UI in memory and syncs it with the real DOM via an efficient reconciliation process (diffing) to improve rendering performance.',
    category: 'Web Dev',
    isLearned: false,
    isDifficult: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '1717660000005',
    question: 'What is a deadlock in Operating Systems, and what are its four necessary conditions?',
    answer: 'A state where a set of processes are blocked because each process holds a resource and waits for another. Conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.',
    category: 'OS',
    isLearned: false,
    isDifficult: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_STATS = {
  studySessionsCount: 0,
  streakDays: 0,
  lastSessionDate: null
};

// Initialize Database
function initDatabase() {
  if (!localStorage.getItem(DB_CARDS_KEY)) {
    localStorage.setItem(DB_CARDS_KEY, JSON.stringify(DEFAULT_FLASHCARDS));
  }
  if (!localStorage.getItem(DB_STATS_KEY)) {
    localStorage.setItem(DB_STATS_KEY, JSON.stringify(DEFAULT_STATS));
  }
}

// Get All Flashcards
function getCards() {
  initDatabase();
  return JSON.parse(localStorage.getItem(DB_CARDS_KEY));
}

// Save Flashcards List
function saveCards(cards) {
  localStorage.setItem(DB_CARDS_KEY, JSON.stringify(cards));
  // Dispatch custom storage update event for responsive pages
  window.dispatchEvent(new Event('smartflash_db_update'));
}

// Get Global Learning Stats
function getStats() {
  initDatabase();
  return JSON.parse(localStorage.getItem(DB_STATS_KEY));
}

// Save Global Learning Stats
function saveStats(stats) {
  localStorage.setItem(DB_STATS_KEY, JSON.stringify(stats));
  window.dispatchEvent(new Event('smartflash_stats_update'));
}

// Increment Study Sessions Trackers
function incrementStudySessions() {
  const stats = getStats();
  stats.studySessionsCount = (stats.studySessionsCount || 0) + 1;
  
  // Update streak logic
  const today = new Date().toDateString();
  if (stats.lastSessionDate) {
    const lastDate = new Date(stats.lastSessionDate).toDateString();
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (new Date(stats.lastSessionDate).toDateString() === yesterday.toDateString()) {
        stats.streakDays += 1;
      } else {
        stats.streakDays = 1;
      }
    }
  } else {
    stats.streakDays = 1;
  }
  stats.lastSessionDate = new Date().toISOString();
  saveStats(stats);
}

// Reset Entire App Database
function resetEntireDatabase() {
  localStorage.removeItem(DB_CARDS_KEY);
  localStorage.removeItem(DB_STATS_KEY);
  initDatabase();
  showToast('Database reset to defaults!', 'warning');
}

// --- Toast Notification Engine ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-message toast-${type}`;
  
  // Set icons based on notification type
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
  } else {
    // Info default
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
  }
  
  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);
  
  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3500);
}

// --- Dynamic Theme Manager ---
function initTheme() {
  const savedTheme = localStorage.getItem('smartflash_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('smartflash_theme', newTheme);
  updateThemeIcon(newTheme);
  showToast(`Theme switched to ${newTheme} mode!`, 'info');
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle svg');
  if (!icon) return;
  if (theme === 'dark') {
    // Sun Icon
    icon.innerHTML = `<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>`;
  } else {
    // Moon Icon
    icon.innerHTML = `<path d="M12.3 22h-.1c-5.5 0-10-4.5-10-10 0-4.8 3.5-9 8.3-9.9.5-.1.9.3.8.8-.4 2 .2 4.1 1.6 5.6 1.5 1.4 3.6 2 5.6 1.6.5-.1.9.3.8.8-.9 4.8-5.1 8.3-9.9 8.3h-.1zm-2.3-3.2c3 0 5.6-1.7 6.9-4.2-1.6.4-3.3.1-4.7-1.1-1.6-1.4-2.4-3.5-2-5.6-2.5 1.3-4.2 3.9-4.2 6.9 0 4.3 3.5 7.8 7.8 7.8v-.2z"/>`;
  }
}

// --- Dynamic Header & Footer Generator ---
function renderLayout() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

  // Render Navigation Bar
  const navContainer = document.createElement('nav');
  navContainer.className = 'glass-nav';
  
  const activeClass = (path) => pageName === path ? 'active' : '';

  navContainer.innerHTML = `
    <div class="nav-content">
      <a href="index.html" class="nav-brand">
        ⚡ Smart<span>Flash</span>
      </a>
      <div class="nav-links" id="nav-links">
        <a href="index.html" class="nav-link ${activeClass('index.html')}">Home</a>
        <a href="dashboard.html" class="nav-link ${activeClass('dashboard.html')}">Dashboard</a>
        <a href="flashcards.html" class="nav-link ${activeClass('flashcards.html')}">Manage</a>
        <a href="study.html" class="nav-link ${activeClass('study.html')}">Study Deck</a>
        <a href="progress.html" class="nav-link ${activeClass('progress.html')}">Progress</a>
        <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">
          <svg viewBox="0 0 24 24"></svg>
        </button>
      </div>
      <button class="nav-mobile-btn" onclick="toggleMobileMenu()" aria-label="Toggle mobile menu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  `;
  
  // Insert at top of app container
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.insertBefore(navContainer, appContainer.firstChild);
  }

  // Render Footer
 // Render Footer
// Render Footer
const footerContainer = document.createElement('footer');
footerContainer.className = 'unified-footer';

footerContainer.innerHTML = `
<div class="footer-content">

    <div class="footer-brand">
        <h3>⚡ SmartFlash</h3>
        <p>Learn smarter with interactive flashcards for exams, interviews and daily revision.</p>
    </div>

    <div class="footer-copy">
        <p>© ${new Date().getFullYear()} SmartFlash</p>
        <p>Made with ❤️ using HTML, CSS & JavaScript</p>
    </div>

</div>
`;
  
  if (appContainer) {
    appContainer.appendChild(footerContainer);
  }

  // Initialize theme icon in navigation bar
  const savedTheme = localStorage.getItem('smartflash_theme') || 'dark';
  updateThemeIcon(savedTheme);
}

// Mobile Navbar toggler helper
function toggleMobileMenu() {
  const navLinks = document.getElementById('nav-links');
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

// Boot up listeners on Page Load
document.addEventListener('DOMContentLoaded', () => {
  initDatabase();
  initTheme();
  renderLayout();
});
