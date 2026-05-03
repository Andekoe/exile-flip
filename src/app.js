let currentFlips = [];
let currentLeague = getSavedLeague();

const searchInput = document.getElementById('searchInput');
const checkPricesBtn = document.getElementById('checkPricesBtn');
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

async function loadCardSuggestions() {
  const datalist = document.getElementById('cardSuggestions');
  const names = await fetchAllCardNames(currentLeague);
  datalist.innerHTML = '';
  names.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
}

function onLeagueChange() {
  currentLeague = leagueSelect.value;
  saveLeague(currentLeague);
  currentFlips = [];
  loadCardSuggestions();
  statusMessage.textContent = 'League changed. Click "Check Prices" to refresh data.';
}

async function checkPrices() {
  const searchTerm = searchInput.value.trim();

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
      divinePrice: item.divinePrice,
      stackSize: item.stackSize,
      reward: item.reward,
      rewardValue: item.rewardValue,
      totalCostChaos: item.totalCostChaos,
      totalCostDivine: item.totalCostDivine,
      profitChaos: item.profitChaos,
      profitDivine: item.profitDivine
    }));

    displayResults(currentFlips);
    statusMessage.textContent = `Found ${currentFlips.length} card${currentFlips.length !== 1 ? 's' : ''}.`;
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

    const stackLabel = flip.stackSize !== null ? flip.stackSize : '?';
    const totalChaos = flip.totalCostChaos !== null ? `${formatPrice(flip.totalCostChaos)}c` : '?';
    const totalDivine = flip.totalCostDivine !== null ? `${flip.totalCostDivine.toFixed(2)} div` : '?';
    const rewardLabel = flip.reward ? sanitizeInput(flip.reward) : '?';

    let profitLabel = '?';
    let profitClass = '';
    if (flip.profitChaos !== null) {
      const sign = flip.profitChaos >= 0 ? '+' : '';
      profitLabel = `${sign}${formatPrice(flip.profitChaos)}c / ${sign}${flip.profitDivine.toFixed(2)} div`;
      profitClass = flip.profitChaos >= 0 ? 'table__cell--profitable' : 'table__cell--loss';
    }

    row.innerHTML = `
      <td class="table__cell table__cell--name">${sanitizeInput(flip.cardName)}</td>
      <td class="table__cell table__cell--stack">${stackLabel}</td>
      <td class="table__cell table__cell--buy">${formatPrice(flip.buyPrice)}c / ${flip.divinePrice.toFixed(2)} div</td>
      <td class="table__cell table__cell--total">${totalChaos} / ${totalDivine}</td>
      <td class="table__cell table__cell--reward">${rewardLabel}</td>
      <td class="table__cell table__cell--profit ${profitClass}">${profitLabel}</td>
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

    const totalLabel = item.totalCostDivine !== null
      ? `${item.totalCostDivine.toFixed(1)} div set`
      : `${formatPrice(item.buyPrice)}c/card`;

    historyItem.innerHTML = `
      <span class="history__card">${sanitizeInput(item.cardName)}</span>
      <span class="history__profit">${totalLabel}</span>
      <span class="history__time">${formatTime(item.timestamp)}</span>
    `;

    historyItem.addEventListener('click', () => {
      searchInput.value = item.cardName;
      checkPrices();
    });

    historyList.appendChild(historyItem);
  });
}

checkPricesBtn.addEventListener('click', checkPrices);
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
loadCardSuggestions();
