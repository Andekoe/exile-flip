const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

function proxyRequest(targetUrl, req, res) {
  const protocol = targetUrl.startsWith('https') ? https : http;

  protocol.get(targetUrl, (proxyRes) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    proxyRes.pipe(res);
  }).on('error', (error) => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const pathname = req.url;

  if (pathname.startsWith('/api/poe-ninja')) {
    const params = url.parse(req.url, true).query;
    const league = encodeURIComponent(params.league || 'Softcore');
    const type = encodeURIComponent(params.type || 'DivinationCard');

    const targetUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${league}&type=${type}`;
    console.log('Proxying:', targetUrl);

    proxyRequest(targetUrl, req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
