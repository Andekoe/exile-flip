let currentFlips = [];
let currentLeague = getSavedLeague();

const searchInput = document.getElementById('searchInput');
const checkPricesBtn = document.getElementById('checkPricesBtn');
const profitFilter = document.getElementById('profitFilter');
const statusMessage = document.getElementById('statusMessage');
const leagueSelect = document.getElementById('leagueSelect');
const resultsTable = document.getElementById('resultsTable');
const noResults = document.getElementById('noResults');
const resultsBody = document.getElementById('resultsBody');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function initializeLeagueSelector() {
  LEAGUES.forEach(league => {
    const option = document.createElement('option');
    option.value = league;
    option.textContent = league;
    leagueSelect.appendChild(option);
  });
  leagueSelect.value = currentLeague;
}

function onLeagueChange() {
  currentLeague = leagueSelect.value;
  saveLeague(currentLeague);
  if (currentFlips.length > 0) {
    statusMessage.textContent = 'League changed. Click "Check Prices" to refresh data.';
  }
}

async function checkPrices() {
  const searchTerm = searchInput.value.trim();
  const minProfit = parseFloat(profitFilter.value) || 0;

  if (!searchTerm) {
    statusMessage.textContent = 'Please enter a card name to search.';
    return;
  }

  statusMessage.textContent = 'Fetching prices...';
  checkPricesBtn.disabled = true;

  try {
    const priceData = await getCardPrices(searchTerm, currentLeague);

    if (priceData.length === 0) {
      statusMessage.textContent = 'No divination cards found matching your search.';
      resultsTable.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    currentFlips = priceData.map(item => ({
      cardName: item.cardName,
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice,
      divinePrice: item.divinePrice,
      stackSize: item.stackSize,
      totalCostChaos: item.totalCostChaos,
      totalCostDivine: item.totalCostDivine,
      reward: item.reward,
      profitPercent: calculateProfit(item.buyPrice, item.sellPrice)
    }));

    const filtered = filterFlips(currentFlips, minProfit, '');

    if (filtered.length === 0) {
      statusMessage.textContent = `Found ${currentFlips.length} cards, but none meet the ${minProfit}% profit threshold.`;
      resultsTable.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    if (currentFlips.length > 0) console.log('Sample flip data:', currentFlips[0]);
    displayResults(filtered);
    statusMessage.textContent = `Found ${filtered.length} profitable flips.`;
  } catch (error) {
    console.error('Check prices error:', error);
    statusMessage.textContent = `Error: ${error.message}`;
    resultsTable.style.display = 'none';
    noResults.style.display = 'block';
  } finally {
    checkPricesBtn.disabled = false;
  }
}

function displayResults(flips) {
  resultsBody.innerHTML = '';

  flips.forEach(flip => {
    const row = document.createElement('tr');
    row.className = 'table__row';

    const profitClass = flip.profitPercent >= 50 ? 'table__cell--high-profit' :
                        flip.profitPercent >= 20 ? 'table__cell--med-profit' :
                        'table__cell--low-profit';

    row.innerHTML = `
      <td class="table__cell table__cell--name">${sanitizeInput(flip.cardName)}</td>
      <td class="table__cell table__cell--buy">${formatPrice(flip.buyPrice)}c</td>
      <td class="table__cell table__cell--divine">${flip.divinePrice.toFixed(2)} div</td>
      <td class="table__cell table__cell--sell">${formatPrice(flip.sellPrice)}c</td>
      <td class="table__cell table__cell--profit ${profitClass}">${flip.profitPercent.toFixed(1)}%</td>
    `;

    row.addEventListener('click', () => {
      saveToHistory(flip);
      renderHistory();
    });

    resultsBody.appendChild(row);
  });

  resultsTable.style.display = 'table';
  noResults.style.display = 'none';
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<p class="history__empty">No recent searches yet.</p>';
    return;
  }

  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history__item';

    historyItem.innerHTML = `
      <span class="history__card">${sanitizeInput(item.cardName)}</span>
      <span class="history__profit">${item.profitPercent.toFixed(1)}%</span>
      <span class="history__time">${formatTime(item.timestamp)}</span>
    `;

    historyItem.addEventListener('click', () => {
      searchInput.value = item.cardName;
      profitFilter.value = 0;
      checkPrices();
    });

    historyList.appendChild(historyItem);
  });
}

function onProfitFilterChange() {
  if (currentFlips.length === 0) return;

  const minProfit = parseFloat(profitFilter.value) || 0;
  const filtered = filterFlips(currentFlips, minProfit, searchInput.value);

  if (filtered.length === 0) {
    resultsTable.style.display = 'none';
    noResults.style.display = 'block';
    statusMessage.textContent = `No cards meet the ${minProfit}% profit threshold.`;
    return;
  }

  displayResults(filtered);
  statusMessage.textContent = `Showing ${filtered.length} of ${currentFlips.length} cards.`;
}

function onSearchChange() {
  if (currentFlips.length === 0) return;

  const minProfit = parseFloat(profitFilter.value) || 0;
  const searchTerm = searchInput.value.trim();
  const filtered = filterFlips(currentFlips, minProfit, searchTerm);

  if (filtered.length === 0) {
    resultsTable.style.display = 'none';
    noResults.style.display = 'block';
    statusMessage.textContent = 'No cards match your search.';
    return;
  }

  displayResults(filtered);
  statusMessage.textContent = `Showing ${filtered.length} of ${currentFlips.length} cards.`;
}

checkPricesBtn.addEventListener('click', checkPrices);
profitFilter.addEventListener('input', onProfitFilterChange);
searchInput.addEventListener('input', onSearchChange);
leagueSelect.addEventListener('change', onLeagueChange);

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Clear all history?')) {
    clearHistory();
    renderHistory();
  }
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    checkPrices();
  }
});

initializeLeagueSelector();
renderHistory();
