const CARD_DB_URL = 'https://raw.githubusercontent.com/mikifriki/Divination-Cards/master/db.json';

async function fetchCardMetadata() {
  try {
    const response = await fetch(CARD_DB_URL);
    if (!response.ok) return {};
    const data = await response.json();

    const map = {};
    (data.Cards || []).forEach(card => {
      if (card.name) {
        map[card.name] = { stackSize: card.amount || null, reward: card.item || null };
      }
    });
    return map;
  } catch (error) {
    console.error('Card DB fetch error:', error);
    return {};
  }
}

async function fetchItemPrices(league, type) {
  try {
    const url = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}`;
    const response = await fetch(url);
    if (!response.ok) return {};

    const data = await response.json();
    const priceMap = {};

    const items = data.items || [];
    const lines = data.lines || [];
    const idToName = {};
    items.forEach(item => { idToName[item.id] = item.name; });
    lines.forEach(line => {
      const name = idToName[line.id];
      if (name && line.primaryValue !== undefined) priceMap[name] = line.primaryValue;
    });

    return priceMap;
  } catch {
    return {};
  }
}

// Parse reward text to extract quantity and item name
// e.g. "10x Chaos Orb" → { qty: 10, name: "Chaos Orb" }
function parseReward(rewardText) {
  if (!rewardText) return { qty: 1, name: null };
  const match = rewardText.match(/^(\d+)[x×]\s*(.+)$/i);
  if (match) return { qty: parseInt(match[1]), name: match[2].trim() };
  return { qty: 1, name: rewardText.trim() };
}

export default async function handler(req, res) {
  const { league, type } = req.query;

  if (!league || !type) {
    return res.status(400).json({ error: 'Missing league or type parameter' });
  }

  const ninjaUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}`;

  try {
    const [ninjaResponse, cardMeta, currencyPrices, uniqueWeaponPrices, uniqueArmourPrices, uniqueAccessoryPrices] = await Promise.all([
      fetch(ninjaUrl),
      fetchCardMetadata(),
      fetchItemPrices(league, 'Currency'),
      fetchItemPrices(league, 'UniqueWeapon'),
      fetchItemPrices(league, 'UniqueArmour'),
      fetchItemPrices(league, 'UniqueAccessory')
    ]);

    if (!ninjaResponse.ok) {
      return res.status(ninjaResponse.status).json({ error: `poe.ninja returned ${ninjaResponse.status}` });
    }

    const data = await ninjaResponse.json();
    const allItemPrices = { ...currencyPrices, ...uniqueWeaponPrices, ...uniqueArmourPrices, ...uniqueAccessoryPrices };

    const enrichedItems = (data.items || []).map(item => {
      const meta = cardMeta[item.name] || {};
      const { qty, name: rewardName } = parseReward(meta.reward);
      const rewardUnitPrice = rewardName ? (allItemPrices[rewardName] ?? null) : null;
      const rewardValue = rewardUnitPrice !== null ? rewardUnitPrice * qty : null;

      return {
        ...item,
        stackSize: meta.stackSize ?? null,
        reward: meta.reward ?? null,
        rewardValue
      };
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300');
    res.json({ ...data, items: enrichedItems });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}
