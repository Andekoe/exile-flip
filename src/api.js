const POE_NINJA_BASE = 'https://poe.ninja/poe1/api/economy/exchange/current/overview';

async function fetchDivinationPrices(league) {
  const url = `${POE_NINJA_BASE}?league=${encodeURIComponent(league)}&type=DivinationCard`;
  console.log('Fetching from:', url);

  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Found', data.exchange_rates?.length || 0, 'items');
    return parsePoeNinjaResponse(data);
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`Failed to fetch from poe.ninja: ${error.message}`);
  }
}

function parsePoeNinjaResponse(data) {
  const priceMap = {};

  if (data.exchange_rates && Array.isArray(data.exchange_rates)) {
    data.exchange_rates.forEach(item => {
      if (item.info && item.info.name && item.pay_amount && item.receive_amount) {
        const cardName = item.info.name;
        const buyPrice = item.pay_amount || 0;
        const sellPrice = item.receive_amount || 0;

        priceMap[cardName] = {
          chaos: buyPrice,
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
