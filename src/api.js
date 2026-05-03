const MOCK_PRICES = {
  'The Gambler': { chaos: 5, exalted: 0 },
  'Echoes of Betrayal': { chaos: 15, exalted: 0 },
  'The Forsaken Shrine': { chaos: 8, exalted: 0 },
  'House of Mirrors': { chaos: 200, exalted: 2 },
  'The Nurse': { chaos: 85, exalted: 1 },
  'Fiend': { chaos: 12, exalted: 0 },
  'Omnium': { chaos: 45, exalted: 0 },
  "Saint's Treasure": { chaos: 22, exalted: 0 },
  'The Void': { chaos: 3, exalted: 0 },
  'Wealth': { chaos: 18, exalted: 0 },
  'The Feast': { chaos: 6, exalted: 0 },
  'Dying Wish': { chaos: 25, exalted: 0 },
  'Seeker': { chaos: 35, exalted: 0 },
  'The Tyrant': { chaos: 120, exalted: 1 },
  'Unbridled Avarice': { chaos: 42, exalted: 0 },
  'Trash to Treasure': { chaos: 16, exalted: 0 },
  'The Inventory': { chaos: 9, exalted: 0 },
  'Gift to the Goddess': { chaos: 180, exalted: 1 },
  'Destiny': { chaos: 50, exalted: 0 },
  "The Dragon's Heart": { chaos: 65, exalted: 0 }
};

async function fetchDivinationPrices(league) {
  console.log('Using mock price data (poe.ninja API unavailable)');
  return MOCK_PRICES;
}

function parsePoeNinjaResponse(data) {
  if (!data.lines || !Array.isArray(data.lines)) {
    throw new Error('Invalid response format');
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
  try {
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
  } catch (error) {
    console.error('getCardPrices error:', error);
    throw error;
  }
}
