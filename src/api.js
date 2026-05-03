const POE_NINJA_ENDPOINTS = [
  'https://poe.ninja/api/data/itemoverview?league={league}&type=DivinationCard',
  'https://poe.ninja/api/data/itemoverview?league={league}&type=Divination%20Card',
  'https://poe.ninja/api/data/divinationcardsoverview?league={league}',
];

async function tryEndpoint(url) {
  console.log('Trying endpoint:', url);
  const response = await fetch(url);
  console.log('Response status:', response.status);

  if (!response.ok) {
    throw new Error(`Status ${response.status}`);
  }

  const data = await response.json();
  if (!data.lines || !Array.isArray(data.lines)) {
    throw new Error('Invalid response format');
  }

  console.log('Success! Found', data.lines.length, 'items');
  return data;
}

async function fetchDivinationPrices(league) {
  for (const endpoint of POE_NINJA_ENDPOINTS) {
    try {
      const url = endpoint.replace('{league}', encodeURIComponent(league));
      const data = await tryEndpoint(url);
      return parsePoeNinjaResponse(data);
    } catch (error) {
      console.warn(`Endpoint failed: ${error.message}`);
      continue;
    }
  }

  throw new Error('All poe.ninja endpoints failed. The API may be down or blocking requests.');
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
