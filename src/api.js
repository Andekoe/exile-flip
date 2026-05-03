async function fetchDivinationPrices(league) {
  const url = `/api/proxy?league=${encodeURIComponent(league)}&type=DivinationCard`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Found', data.lines?.length || 0, 'divination cards, wiki debug:', data._wikiDebug);
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
    const itemMeta = {};
    data.items.forEach(item => {
      itemMeta[item.id] = { name: item.name, stackSize: item.stackSize ?? null, reward: item.reward ?? null };
    });

    data.lines.forEach(line => {
      const meta = itemMeta[line.id];
      if (!meta) return;

      const stackSize = meta.stackSize || 1;
      const chaosPrice = line.primaryValue;

      if (meta.name && chaosPrice !== undefined) {
        priceMap[meta.name] = {
          chaos: chaosPrice,
          divine: chaosPrice * divineRate,
          stackSize: meta.stackSize,
          totalCostChaos: chaosPrice * stackSize,
          totalCostDivine: chaosPrice * stackSize * divineRate,
          reward: meta.reward
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
          divinePrice: prices.divine,
          stackSize: prices.stackSize,
          totalCostChaos: prices.totalCostChaos,
          totalCostDivine: prices.totalCostDivine,
          reward: prices.reward
        });
      }
    });

    return results;
  } catch (error) {
    console.error('getCardPrices error:', error);
    throw error;
  }
}
