async function fetchDivinationPrices(league) {
  const url = `/api/proxy?league=${encodeURIComponent(league)}&type=DivinationCard`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Found', data.lines?.length || 0, 'divination cards');
    return parsePoeNinjaResponse(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`Failed to fetch from poe.ninja: ${error.message}`);
  }
}

function parsePoeNinjaResponse(data) {
  const priceMap = {};
  const divineRate = data.core?.rates?.divine || 0;

  if (data.lines && Array.isArray(data.lines) && data.items && Array.isArray(data.items)) {
    const itemMap = {};
    data.items.forEach(item => {
      if (item.id === 'house-of-mirrors') console.log('Sample item entry:', item);
      itemMap[item.id] = item.name;
    });

    data.lines.forEach(line => {
      const cardName = itemMap[line.id];

      if (cardName && line.primaryValue !== undefined) {
        priceMap[cardName] = {
          chaos: line.primaryValue,
          divine: line.primaryValue * divineRate
        };
      }
    });
  }

  if (Object.keys(priceMap).length === 0) {
    throw new Error('No price data found in response');
  }

  return priceMap;
}

async function getCardPrices(searchTerm, league) {
  try {
    const priceMap = await fetchDivinationPrices(league);
    const results = [];

    Object.entries(priceMap).forEach(([cardName, prices]) => {
      if (cardName.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          cardName,
          buyPrice: prices.chaos,
          sellPrice: prices.chaos,
          divinePrice: prices.divine
        });
      }
    });

    return results;
  } catch (error) {
    console.error('getCardPrices error:', error);
    throw error;
  }
}
