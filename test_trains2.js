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
    // ERail URL format
    const html = await fetchHTML('https://erail.in/trains-between-stations/new-delhi-NDLS/mumbai-central-MMCT');
    const $ = cheerio.load(html);
    
    console.log('--- TRAINS BETWEEN (ERAIL) ---');
    console.log('Title:', $('title').text());
    
    let found = false;
    $('table').each((i, el) => {
        const txt = $(el).text();
        if (txt.includes('12952')) {
            console.log('Found trains table:', i);
            const trs = $(el).find('tr');
            console.log('Rows:', trs.length);
            let summary = '';
            trs.slice(0, 3).each((j, tr) => summary += $(tr).text().replace(/\s+/g, ' ').substring(0, 100) + '\n');
            console.log(summary);
            found = true;
        }
    });

    if (!found) {
        console.log('No static table found. E-rail might load via AJAX.');
    }

  } catch (err) {
    console.error(err);
  }
})();
