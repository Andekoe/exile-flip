export default async function handler(req, res) {
  const { league, type } = req.query;

  if (!league || !type) {
    return res.status(400).json({ error: 'Missing league or type parameter' });
  }

  const url = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(league)}&type=${encodeURIComponent(type)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: `poe.ninja returned ${response.status}` });
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'max-age=300');
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: `Failed to fetch from poe.ninja: ${error.message}` });
  }
}
