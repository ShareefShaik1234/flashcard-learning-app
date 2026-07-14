/* ==========================================================================
   SMARTFLASH PROGRESS ANALYTICS CONTROLLER (progress.js)
   Description: Aggregates cards and session data. Computes mastery percentages
                per category, draws CSS progress charts, renders custom insights,
                and manages database wipe validation overlays.
   ========================================================================== */

// DOM Elements
const chartContainer = document.getElementById('category-chart-container');
const totalCardsCounter = document.getElementById('det-total-cards');
const sessionsCounter = document.getElementById('det-sessions');
const streakCounter = document.getElementById('det-streak');
const masteryCounter = document.getElementById('det-mastery-rate');
const insightTextBox = document.getElementById('insight-text');

const btnTriggerReset = document.getElementById('btn-trigger-reset');
const resetOverlay = document.getElementById('reset-confirm-overlay');
const btnResetCancel = document.getElementById('btn-reset-cancel');
const btnResetConfirm = document.getElementById('btn-reset-confirm');
const resetClose = document.getElementById('reset-close');

// --- Render Analytics Data ---
function renderAnalytics() {
  const cards = getCards();
  const stats = getStats();

  const totalCards = cards.length;
  const learnedCount = cards.filter(c => c.isLearned).length;
  const difficultCount = cards.filter(c => c.isDifficult).length;
  const masteryRate = totalCards > 0 ? Math.round((learnedCount / totalCards) * 100) : 0;

  // 1. Render counters
  totalCardsCounter.textContent = totalCards;
  sessionsCounter.textContent = stats.studySessionsCount || 0;
  streakCounter.textContent = `${stats.streakDays || 0} Days`;
  masteryCounter.textContent = `${masteryRate}%`;

  // 2. Compute category statistics
  const catData = {}; // Format: { CategoryName: { total: X, learned: Y } }
  
  cards.forEach(c => {
    const cat = c.category.trim();
    if (!catData[cat]) {
      catData[cat] = { total: 0, learned: 0 };
    }
    catData[cat].total += 1;
    if (c.isLearned) {
      catData[cat].learned += 1;
    }
  });

  // Render Category Bar Charts
  chartContainer.innerHTML = '';
  const categoriesList = Object.keys(catData).sort();

  if (categoriesList.length === 0) {
    chartContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 20px 0; font-size: 0.95rem;">
        No categories found. Create cards to view breakdown.
      </div>`;
  } else {
    categoriesList.forEach(cat => {
      const total = catData[cat].total;
      const learned = catData[cat].learned;
      const percent = Math.round((learned / total) * 100);

      const barRow = document.createElement('div');
      barRow.className = 'chart-bar-item';
      barRow.innerHTML = `
        <div class="chart-bar-info">
          <span>🏷️ ${escapeHtml(cat)}</span>
          <span style="color: var(--text-muted);">${learned}/${total} Learned (${percent}%)</span>
        </div>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" id="bar-fill-${escapeHtml(cat.replace(/\s+/g, '-'))}"></div>
        </div>
      `;
      chartContainer.appendChild(barRow);

      // Animate bar width in a slight delay for smooth entry slide
      setTimeout(() => {
        const fillBar = document.getElementById(`bar-fill-${escapeHtml(cat.replace(/\s+/g, '-'))}`);
        if (fillBar) {
          fillBar.style.width = `${percent}%`;
        }
      }, 100);
    });
  }

  // 3. Render Custom Analytics Insights
  generateInsights(totalCards, learnedCount, difficultCount, catData);
}

function generateInsights(totalCards, learnedCount, difficultCount, catData) {
  if (totalCards === 0) {
    insightTextBox.innerHTML = `
      Your deck is currently empty. 
      <br><br>
      Go to the <a href="flashcards.html" class="footer-portfolio-link">Manage page</a> to create flashcards. Once you study them, this insights engine will analyze your performance and highlight study recommendations!`;
    return;
  }

  let insightHTML = '';
  
  // Find category with lowest completion rate
  let weakestCategory = '';
  let lowestPercent = 101; // higher than max possible 100

  for (const cat in catData) {
    const rate = Math.round((catData[cat].learned / catData[cat].total) * 100);
    if (rate < lowestPercent) {
      lowestPercent = rate;
      weakestCategory = cat;
    }
  }

  // 1. Weakest Category Advice
  if (lowestPercent === 100) {
    insightHTML += `<strong>🎉 Perfection Achieved!</strong> You have fully learned 100% of all flashcards in every subject. Fantastic job! You can create new cards to expand your syllabus further.`;
  } else if (weakestCategory) {
    insightHTML += `🔍 Your current weakest subject is <strong>${escapeHtml(weakestCategory)}</strong>, which stands at only <strong>${lowestPercent}% mastery</strong>. We recommend launching a focused study session filtering specifically for this category to boost retention.`;
  }

  // 2. Difficult Cards Advice
  if (difficultCount > 0) {
    insightHTML += `<br><br>⚠️ You have marked <strong>${difficultCount} cards as Difficult</strong>. When configuring your next study session, filter your deck to <em>Difficult Cards Only</em> to target these concepts directly and convert them to learned.`;
  } else if (totalCards > 0 && difficultCount === 0) {
    insightHTML += `<br><br>👍 Great job! You have zero difficult flags active. Keep reviewing your deck to maintain familiarity with all key concepts.`;
  }

  // 3. Overall study efficiency summary
  const masteryPercentage = Math.round((learnedCount / totalCards) * 100);
  insightHTML += `<br><br>📈 Your overall deck mastery is <strong>${masteryPercentage}%</strong> (${learnedCount} out of ${totalCards} cards learned).`;

  insightTextBox.innerHTML = insightHTML;
}

// --- Danger Zone Modal Controllers ---
function openResetModal() {
  resetOverlay.classList.add('active');
}

function closeResetModal() {
  resetOverlay.classList.remove('active');
}

function confirmReset() {
  resetEntireDatabase();
  closeResetModal();
  // Delay slightly to allow the toast to register, then reload the page
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Event Bindings
btnTriggerReset.addEventListener('click', openResetModal);
resetClose.addEventListener('click', closeResetModal);
btnResetCancel.addEventListener('click', closeResetModal);
btnResetConfirm.addEventListener('click', confirmReset);

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    renderAnalytics();
  }, 150);
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
