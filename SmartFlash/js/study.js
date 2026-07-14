/* ==========================================================================
   SMARTFLASH STUDY SESSION CONTROLLER (study.js)
   Description: Controls active study configurations, 3D animations, shuffler,
                button triggers, keyboard shortcuts, and session completion metrics.
   ========================================================================== */

// Active Session States
let activeDeck = [];
let currentIndex = 0;
let isCardFlipped = false;

// DOM Elements
const setupPanel = document.getElementById('deck-setup-panel');
const sessionPanel = document.getElementById('active-session-panel');
const summaryPanel = document.getElementById('session-summary-panel');

const setupCategory = document.getElementById('setup-category');
const setupFilter = document.getElementById('setup-filter');
const setupShuffle = document.getElementById('setup-shuffle');
const btnStartSession = document.getElementById('btn-start-session');

const sessionCatTitle = document.getElementById('session-category-title');
const sessionProgressText = document.getElementById('session-progress-text');
const sessionProgressFill = document.getElementById('session-progress-fill');

const flashcardPlayer = document.getElementById('flashcard-player');
const flashcardInner = document.getElementById('flashcard-inner');
const cardFrontCat = document.getElementById('card-front-category');
const cardFrontText = document.getElementById('card-front-text');
const cardBackCat = document.getElementById('card-back-category');
const cardBackText = document.getElementById('card-back-text');

const btnPrevCard = document.getElementById('btn-prev-card');
const btnNextCard = document.getElementById('btn-next-card');
const btnToggleLearned = document.getElementById('btn-toggle-learned');
const btnToggleDifficult = document.getElementById('btn-toggle-difficult');
const btnStopSession = document.getElementById('btn-stop-session');

const summaryTotal = document.getElementById('summary-total');
const summaryLearned = document.getElementById('summary-learned');
const btnRestartSession = document.getElementById('btn-restart-session');
const btnSummaryExit = document.getElementById('btn-summary-exit');

// --- Session Initializations ---
function populateSetupCategories() {
  const cards = getCards();
  const categories = [...new Set(cards.map(c => c.category.trim()))].filter(Boolean);
  
  // Keep selection
  const currentSelection = setupCategory.value;
  
  setupCategory.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.toLowerCase();
    option.textContent = cat;
    setupCategory.appendChild(option);
  });

  if (categories.some(c => c.toLowerCase() === currentSelection)) {
    setupCategory.value = currentSelection;
  }
}

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startSession() {
  const cards = getCards();
  const categorySelected = setupCategory.value;
  const statusFilter = setupFilter.value;
  const shouldShuffle = setupShuffle.checked;

  // 1. Filter Cards
  let filtered = cards.filter(c => {
    const matchCat = categorySelected === 'all' || 
                      c.category.trim().toLowerCase() === categorySelected;
    
    let matchStatus = true;
    if (statusFilter === 'difficult') {
      matchStatus = c.isDifficult;
    } else if (statusFilter === 'learned') {
      matchStatus = c.isLearned;
    } else if (statusFilter === 'unlearned') {
      matchStatus = !c.isLearned;
    }

    return matchCat && matchStatus;
  });

  // Check if selection is empty
  if (filtered.length === 0) {
    showToast('No flashcards found matching the selected filters!', 'error');
    return;
  }

  // 2. Shuffle if requested
  if (shouldShuffle) {
    filtered = shuffleArray([...filtered]);
  }

  // 3. Set Active Deck details
  activeDeck = filtered;
  currentIndex = 0;
  isCardFlipped = false;

  // 4. Record Study Session Stat in app.js
  incrementStudySessions();

  // 5. Swap Screen Visibility
  setupPanel.style.display = 'none';
  summaryPanel.style.display = 'none';
  sessionPanel.style.display = 'flex';

  showToast(`Session started with ${activeDeck.length} cards!`, 'success');
  renderCard();
}

// --- Player Controllers ---
function renderCard() {
  if (activeDeck.length === 0 || currentIndex >= activeDeck.length) return;
  
  const card = activeDeck[currentIndex];
  
  // Reset card rotation state
  isCardFlipped = false;
  flashcardPlayer.classList.remove('is-flipped');

  // Fill contents
  sessionCatTitle.textContent = `Category: ${card.category}`;
  sessionProgressText.textContent = `Card ${currentIndex + 1} of ${activeDeck.length}`;
  
  // Smoothly fill progress bar
  const progressPercent = Math.round(((currentIndex + 1) / activeDeck.length) * 100);
  sessionProgressFill.style.width = `${progressPercent}%`;

  cardFrontCat.textContent = card.category;
  cardFrontText.textContent = card.question;
  cardBackCat.textContent = `${card.category} (Answer)`;
  cardBackText.textContent = card.answer;

  // Update button highlights
  updateButtonStates(card);
}

function updateButtonStates(card) {
  // Reset buttons
  btnToggleLearned.className = 'btn btn-glass';
  btnToggleDifficult.className = 'btn btn-glass';
  btnToggleLearned.style.boxShadow = '';
  btnToggleDifficult.style.boxShadow = '';

  // Get freshest db state of this card (since other tabs or buttons might update it)
  const freshCards = getCards();
  const dbCard = freshCards.find(c => c.id === card.id) || card;

  if (dbCard.isLearned) {
    btnToggleLearned.className = 'btn btn-success btn-status-toggle active';
    btnToggleLearned.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.6)';
  }
  if (dbCard.isDifficult) {
    btnToggleDifficult.className = 'btn btn-danger btn-status-toggle active';
    btnToggleDifficult.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.6)';
  }
}

function flipCard() {
  isCardFlipped = !isCardFlipped;
  flashcardPlayer.classList.toggle('is-flipped', isCardFlipped);
}

function nextCard() {
  if (currentIndex === activeDeck.length - 1) {
    // Deck fully studied
    endSession();
  } else {
    currentIndex++;
    renderCard();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  } else {
    showToast('This is the first card!', 'info');
  }
}

// Status Toggling inside player
function studyToggleLearned() {
  if (activeDeck.length === 0) return;
  const currentCard = activeDeck[currentIndex];
  
  const cards = getCards();
  const dbCard = cards.find(c => c.id === currentCard.id);
  
  if (dbCard) {
    dbCard.isLearned = !dbCard.isLearned;
    if (dbCard.isLearned) dbCard.isDifficult = false; // Mutually exclusive
    
    saveCards(cards);
    
    // Sync active deck model state
    currentCard.isLearned = dbCard.isLearned;
    currentCard.isDifficult = dbCard.isDifficult;
    
    showToast(currentCard.isLearned ? 'Marked as Learned!' : 'Unmarked Learned', 'success');
    updateButtonStates(currentCard);
  }
}

function studyToggleDifficult() {
  if (activeDeck.length === 0) return;
  const currentCard = activeDeck[currentIndex];
  
  const cards = getCards();
  const dbCard = cards.find(c => c.id === currentCard.id);
  
  if (dbCard) {
    dbCard.isDifficult = !dbCard.isDifficult;
    if (dbCard.isDifficult) dbCard.isLearned = false; // Mutually exclusive
    
    saveCards(cards);
    
    // Sync active deck state
    currentCard.isDifficult = dbCard.isDifficult;
    currentCard.isLearned = dbCard.isLearned;
    
    showToast(currentCard.isDifficult ? 'Marked as Difficult!' : 'Unmarked Difficult', 'warning');
    updateButtonStates(currentCard);
  }
}

function stopSession() {
  if (confirm('Quit studying? Progress made on current cards will be saved, but the session stats will end.')) {
    exitSession();
  }
}

function endSession() {
  // Count how many cards in active deck are learned
  const freshCards = getCards();
  const deckIds = activeDeck.map(c => c.id);
  const studiedDbCards = freshCards.filter(c => deckIds.includes(c.id));
  const learnedCount = studiedDbCards.filter(c => c.isLearned).length;

  summaryTotal.textContent = activeDeck.length;
  summaryLearned.textContent = learnedCount;

  // Swap views
  sessionPanel.style.display = 'none';
  setupPanel.style.display = 'none';
  summaryPanel.style.display = 'block';
  
  showToast('Deck completed! Excellent studying.', 'success');
}

function exitSession() {
  activeDeck = [];
  currentIndex = 0;
  isCardFlipped = false;
  
  sessionPanel.style.display = 'none';
  summaryPanel.style.display = 'none';
  setupPanel.style.display = 'block';
  
  populateSetupCategories();
}

// --- Keyboard Shortcut Listeners ---
window.addEventListener('keydown', (e) => {
  // Avoid triggers if student is typing inside text area or select forms
  const activeTag = document.activeElement.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
    return;
  }

  // Only listen when session is active
  if (sessionPanel.style.display === 'flex') {
    switch(e.code) {
      case 'Space':
        e.preventDefault(); // Stop page scrolling on space
        flipCard();
        break;
      case 'ArrowLeft':
        prevCard();
        break;
      case 'ArrowRight':
        nextCard();
        break;
      case 'KeyL':
        studyToggleLearned();
        break;
      case 'KeyD':
        studyToggleDifficult();
        break;
    }
  }
});

// --- Button Event Bindings ---
btnStartSession.addEventListener('click', startSession);
flashcardPlayer.addEventListener('click', flipCard);
btnPrevCard.addEventListener('click', prevCard);
btnNextCard.addEventListener('click', nextCard);
btnToggleLearned.addEventListener('click', studyToggleLearned);
btnToggleDifficult.addEventListener('click', studyToggleDifficult);
btnStopSession.addEventListener('click', stopSession);

btnRestartSession.addEventListener('click', () => {
  // Restart same configuration
  startSession();
});
btnSummaryExit.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// --- Boot Initializer ---
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    populateSetupCategories();
  }, 200);
});
