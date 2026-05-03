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

export default async function handler(req, res) {
  const { league, type } = req.query;

  if (!league || !type) {
    return res.status(400).json({ error: 'Missing league or type parameter' });
  }

  const ninjaUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}`;

  try {
    const [ninjaResponse, cardMeta] = await Promise.all([
      fetch(ninjaUrl),
      fetchCardMetadata()
    ]);

    if (!ninjaResponse.ok) {
      return res.status(ninjaResponse.status).json({ error: `poe.ninja returned ${ninjaResponse.status}` });
    }

    const data = await ninjaResponse.json();
    const metaCount = Object.keys(cardMeta).length;
    console.log(`Card metadata loaded: ${metaCount} cards`);

    const enrichedItems = (data.items || []).map(item => ({
      ...item,
      stackSize: cardMeta[item.name]?.stackSize ?? null,
      reward: cardMeta[item.name]?.reward ?? null
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300');
    res.json({ ...data, items: enrichedItems });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}
