const WIKI_API = 'https://www.poewiki.net/w/api.php?action=cargoquery&format=json&limit=500&tables=divinationcards&fields=_pageName%3Dname%2Cstack_size%2Creward';

async function fetchWikiCards() {
  const response = await fetch(WIKI_API);
  if (!response.ok) return {};

  const data = await response.json();
  const map = {};

  if (data.cargoquery) {
    data.cargoquery.forEach(entry => {
      const { name, stack_size, reward } = entry.title;
      if (name) {
        map[name] = {
          stackSize: parseInt(stack_size) || 1,
          reward: reward || null
        };
      }
    });
  }

  return map;
}

export default async function handler(req, res) {
  const { league, type } = req.query;

  if (!league || !type) {
    return res.status(400).json({ error: 'Missing league or type parameter' });
  }

  const ninjaUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}`;

  try {
    const [ninjaResponse, wikiCards] = await Promise.all([
      fetch(ninjaUrl),
      fetchWikiCards()
    ]);

    if (!ninjaResponse.ok) {
      return res.status(ninjaResponse.status).json({ error: `poe.ninja returned ${ninjaResponse.status}` });
    }

    const data = await ninjaResponse.json();

    const enrichedItems = (data.items || []).map(item => ({
      ...item,
      stackSize: wikiCards[item.name]?.stackSize ?? null,
      reward: wikiCards[item.name]?.reward ?? null
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300');
    res.json({ ...data, items: enrichedItems });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}
