function formatPrice(price) {
  if (typeof price !== 'number') return '—';
  if (price >= 1000) {
    return (price / 1000).toFixed(2) + 'k';
  }
  return price.toFixed(2);
}

function calculateProfit(buyPrice, sellPrice) {
  if (buyPrice <= 0 || !sellPrice) return 0;
  return ((sellPrice - buyPrice) / buyPrice) * 100;
}

function filterFlips(flips, minProfit, searchTerm) {
  return flips.filter(flip => {
    const profitMatch = flip.profitPercent >= minProfit;
    const searchMatch = flip.cardName.toLowerCase().includes(searchTerm.toLowerCase());
    return profitMatch && searchMatch;
  });
}

function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

function saveToHistory(flip) {
  const history = getHistory();
  const existing = history.findIndex(h => h.cardName === flip.cardName);

  if (existing !== -1) {
    history.splice(existing, 1);
  }

  history.unshift({
    cardName: flip.cardName,
    timestamp: new Date().toISOString(),
    buyPrice: flip.buyPrice,
    sellPrice: flip.sellPrice,
    profitPercent: flip.profitPercent
  });

  history.splice(10);
  localStorage.setItem('exileFlipHistory', JSON.stringify(history));
}

function getHistory() {
  const stored = localStorage.getItem('exileFlipHistory');
  return stored ? JSON.parse(stored) : [];
}

function clearHistory() {
  localStorage.removeItem('exileFlipHistory');
}

function getSavedLeague() {
  return localStorage.getItem('exileFlipLeague') || DEFAULT_LEAGUE;
}

function saveLeague(league) {
  localStorage.setItem('exileFlipLeague', league);
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
