const cheerio = require('cheerio');
const https = require('https');

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode)) {
        return fetchHTML('https://etrain.info' + (res.headers.location.startsWith('/') ? '' : '/') + res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  const html = await fetchHTML('https://etrain.info/train/12301/live');
  const $ = cheerio.load(html);
  
  console.log('--- LIVE STATUS ---');
  console.log('Message:', $('.intrnq_msg').text().trim() || 'No intrnq_msg');
  console.log('Train Name:', $('h1').text());
  
  // Try to find the progress or next station text
  $('table tr').each((i, el) => {
    const text = $(el).text();
    if (text.includes('Current Status')) console.log('Current Status Row:', text);
  });

  const htmlSched = await fetchHTML('https://etrain.info/train/12301/schedule');
  const $2 = cheerio.load(htmlSched);
  console.log('--- SCHEDULE ---');
  // etrain usually has a table with class trainlist or sched
  const rows = $2('.trainlist tr, table.table tr, .myTable tr').length;
  console.log('Schedule rows found:', rows);
})();
