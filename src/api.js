const POE_NINJA_BASE = 'https://poe.ninja/api/data';

async function fetchDivinationPrices(league) {
  try {
    const response = await fetch(
      `${POE_NINJA_BASE}/itemoverview?league=${encodeURIComponent(league)}&type=DivinationCard`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return parsePoeNinjaResponse(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch prices from poe.ninja. Check your internet connection.');
  }
}

function parsePoeNinjaResponse(data) {
  if (!data.lines || !Array.isArray(data.lines)) {
    throw new Error('Invalid response format from poe.ninja');
  }

  const priceMap = {};

  data.lines.forEach(item => {
    if (item.name && item.chaosValue) {
      priceMap[item.name] = {
        chaos: typeof item.chaosValue === 'number' ? item.chaosValue : 0,
        exalted: item.exaltedValue || 0
      };
    }
  });

  return priceMap;
}

async function getCardPrices(cardNames, league) {
  const priceMap = await fetchDivinationPrices(league);
  const results = [];

  cardNames.forEach(cardName => {
    if (priceMap[cardName]) {
      results.push({
        cardName,
        buyPrice: priceMap[cardName].chaos,
        sellPrice: priceMap[cardName].chaos
      });
    }
  });

  return results;
}
