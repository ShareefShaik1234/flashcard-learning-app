/* ==========================================================================
   SMARTFLASH FLASHCARD CRUD MANAGER (flashcards.js)
   Description: Handles search, category Tag management, addition, editing,
                deletion, state flags, and modals.
   ========================================================================== */

let editCardId = null; // Tracking active card in editor (null = Create mode)

// DOM Elements
const gridContainer = document.getElementById('cards-grid-container');
const btnAddCard = document.getElementById('btn-add-card');
const modalOverlay = document.getElementById('card-modal-overlay');
const modalClose = document.getElementById('modal-close');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const cardForm = document.getElementById('card-form');
const modalTitle = document.getElementById('modal-title');

const cardQuestionInput = document.getElementById('card-question');
const cardAnswerInput = document.getElementById('card-answer');
const cardCategoryInput = document.getElementById('card-category');
const categoryDatalist = document.getElementById('category-suggestions');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// --- Modal Controllers ---
function openModal(mode = 'create', card = null) {
  modalOverlay.classList.add('active');
  populateCategorySuggestions();
  
  if (mode === 'edit' && card) {
    editCardId = card.id;
    modalTitle.textContent = 'Edit Flashcard';
    cardQuestionInput.value = card.question;
    cardAnswerInput.value = card.answer;
    cardCategoryInput.value = card.category;
    document.getElementById('btn-modal-submit').textContent = 'Update Card';
  } else {
    editCardId = null;
    modalTitle.textContent = 'Create New Flashcard';
    cardForm.reset();
    document.getElementById('btn-modal-submit').textContent = 'Save Card';
  }
  cardQuestionInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('active');
  cardForm.reset();
  editCardId = null;
}

// Populate datalist with unique categories for autocomplete
function populateCategorySuggestions() {
  const cards = getCards();
  const categories = [...new Set(cards.map(c => c.category.trim()))].filter(Boolean);
  categoryDatalist.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    categoryDatalist.appendChild(option);
  });
}

// --- Card Operations ---
function handleSaveCard(e) {
  e.preventDefault();
  
  const question = cardQuestionInput.value.trim();
  const answer = cardAnswerInput.value.trim();
  const category = cardCategoryInput.value.trim() || 'General';

  if (!question || !answer) {
    showToast('Question and Answer cannot be empty!', 'error');
    return;
  }

  const cards = getCards();

  if (editCardId) {
    // Edit Existing Mode
    const cardIndex = cards.findIndex(c => c.id === editCardId);
    if (cardIndex > -1) {
      cards[cardIndex].question = question;
      cards[cardIndex].answer = answer;
      cards[cardIndex].category = category;
      saveCards(cards);
      showToast('Flashcard updated successfully!', 'success');
    } else {
      showToast('Error: Card not found.', 'error');
    }
  } else {
    // Create Mode
    const newCard = {
      id: Date.now().toString(),
      question,
      answer,
      category,
      isLearned: false,
      isDifficult: false,
      createdAt: new Date().toISOString()
    };
    cards.push(newCard);
    saveCards(cards);
    showToast('Flashcard created successfully!', 'success');
  }

  closeModal();
  renderPage();
}

function deleteCard(id) {
  if (confirm('Are you sure you want to delete this flashcard? This action cannot be undone.')) {
    const cards = getCards();
    const filtered = cards.filter(c => c.id !== id);
    saveCards(filtered);
    showToast('Flashcard deleted!', 'success');
    renderPage();
  }
}

function toggleCardLearned(id) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    card.isLearned = !card.isLearned;
    if (card.isLearned) card.isDifficult = false; // Mutually exclusive flags for clear metric stats
    saveCards(cards);
    showToast(card.isLearned ? 'Marked as Learned!' : 'Unmarked as Learned', 'success');
    renderPage();
  }
}

function toggleCardDifficult(id) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    card.isDifficult = !card.isDifficult;
    if (card.isDifficult) card.isLearned = false; // Mutually exclusive flags
    saveCards(cards);
    showToast(card.isDifficult ? 'Marked as Difficult!' : 'Unmarked as Difficult', 'warning');
    renderPage();
  }
}

// --- Layout rendering filters ---
function populateCategoryFilter() {
  const cards = getCards();
  const categories = [...new Set(cards.map(c => c.category.trim()))].filter(Boolean);
  
  // Save current selection
  const currentSelection = categoryFilter.value;
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.toLowerCase();
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore selection if it still exists
  if (categories.some(c => c.toLowerCase() === currentSelection)) {
    categoryFilter.value = currentSelection;
  } else {
    categoryFilter.value = 'all';
  }
}

function renderCardsGrid() {
  const cards = getCards();
  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedCat = categoryFilter.value;

  // Filter conditions
  const filtered = cards.filter(c => {
    const matchesSearch = c.question.toLowerCase().includes(searchQuery) || 
                          c.answer.toLowerCase().includes(searchQuery);
    
    const matchesCategory = selectedCat === 'all' || 
                            c.category.trim().toLowerCase() === selectedCat;
    
    return matchesSearch && matchesCategory;
  });

  gridContainer.innerHTML = '';

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state glass-card">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mb-1">No Flashcards Found</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">Try adjusting your search terms or create a new card to start.</p>
        <button class="btn btn-primary btn-sm" onclick="openModal('create')">Create Card</button>
      </div>`;
    return;
  }

  filtered.forEach(c => {
    const cardEl = document.createElement('div');
    cardEl.className = 'glass-card mgmt-card';
    
    cardEl.innerHTML = `
      <div>
        <span class="card-cat-badge">${escapeHtml(c.category)}</span>
        <h3 title="${escapeHtml(c.question)}">${escapeHtml(c.question)}</h3>
        <p title="${escapeHtml(c.answer)}" style="cursor: pointer; font-style: italic;" onclick="alert('Full Answer:\\n\\n' + this.getAttribute('data-full'))" data-full="${escapeHtml(c.answer)}">
          <strong>A:</strong> ${escapeHtml(c.answer)}
        </p>
      </div>
      <div class="card-actions">
        <!-- Learned Button -->
        <button class="icon-btn icon-btn-state ${c.isLearned ? 'learned' : ''}" 
                onclick="toggleCardLearned('${c.id}')" 
                title="${c.isLearned ? 'Unmark Learned' : 'Mark as Learned'}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </button>
        <!-- Difficult Button -->
        <button class="icon-btn icon-btn-state ${c.isDifficult ? 'difficult' : ''}" 
                onclick="toggleCardDifficult('${c.id}')" 
                title="${c.isDifficult ? 'Unmark Difficult' : 'Mark as Difficult'}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
        <!-- Edit Button -->
        <button class="icon-btn icon-btn-edit" onclick="editCardTrigger('${c.id}')" title="Edit Card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <!-- Delete Button -->
        <button class="icon-btn icon-btn-delete" onclick="deleteCard('${c.id}')" title="Delete Card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    `;
    gridContainer.appendChild(cardEl);
  });
}

function editCardTrigger(id) {
  const cards = getCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    openModal('edit', card);
  }
}

function renderPage() {
  populateCategoryFilter();
  renderCardsGrid();
}

// --- Listeners & Setups ---
btnAddCard.addEventListener('click', () => openModal('create'));
modalClose.addEventListener('click', closeModal);
btnModalCancel.addEventListener('click', closeModal);
cardForm.addEventListener('submit', handleSaveCard);

// Search & Filter event bindings
searchInput.addEventListener('input', renderCardsGrid);
categoryFilter.addEventListener('change', renderCardsGrid);

// Listen to database updates from other parts of the app
window.addEventListener('smartflash_db_update', () => {
  renderPage();
});

// Load sequence
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderPage();
    
    // Check url search parameters (e.g. ?action=add)
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      openModal('create');
      // Clean url bar without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, 180);
});

// Helper functions
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
