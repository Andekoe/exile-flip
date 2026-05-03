async function fetchDivinationPrices(league) {
  const url = `/api/proxy?league=${encodeURIComponent(league)}&type=DivinationCard`;

  console.log('Fetching divination card prices');
  console.log('Target URL:', url);

  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    console.log('Found', data.exchange_rates?.length || 0, 'items');
    return parsePoeNinjaResponse(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`Failed to fetch from poe.ninja: ${error.message}`);
  }
}

function parsePoeNinjaResponse(data) {
  const priceMap = {};

  if (data.lines && Array.isArray(data.lines) && data.items && Array.isArray(data.items)) {
    const itemMap = {};
    data.items.forEach(item => {
      itemMap[item.id] = item.name;
    });

    data.lines.forEach(line => {
      const cardName = itemMap[line.id];
      if (cardName && line.primaryValue !== undefined) {
        priceMap[cardName] = {
          chaos: line.primaryValue,
          exalted: 0
        };
      }
    });
  }

  if (Object.keys(priceMap).length === 0) {
    throw new Error('No price data found in response');
  }

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
