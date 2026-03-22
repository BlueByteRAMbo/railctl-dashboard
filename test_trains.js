const cheerio = require('cheerio');
const https = require('https');

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const html = await fetchHTML('https://www.confirmtkt.com/train-schedule/NDLS-to-BCT'); // or similar
    // Actually let's try the API endpoint
    // Sometimes confirmtkt has an open API for trains between stations
    const html2 = await fetchHTML('https://www.confirmtkt.com/pnr-status'); 
    console.log('Confirmtkt tested');
  } catch (err) {
    console.error(err);
  }
})();
