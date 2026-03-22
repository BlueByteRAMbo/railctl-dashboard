const fs = require('fs');
let txt = '';
try {
  txt = fs.readFileSync('C:\\Users\\LDCN7492\\tmp\\confirmtkt.html', 'utf8');
} catch(e) {
  txt = fs.readFileSync('C:\\Users\\LDCN7492\\tmp\\confirmtkt.html', 'utf16le');
}

// look for trains data
const match = txt.match(/var\s+initialData\s*=\s*(\{.*?\});/i) || txt.match(/trains\s*:\s*\[(.*?)\]/);
if (match) {
    console.log('Found trains data snippet!');
    console.log(match[0].substring(0, 300));
} else {
    console.log('No json data found in confirmtkt html');
    
    // Look for table
    const cheerio = require('cheerio');
    const $ = cheerio.load(txt);
    console.log('Title:', $('title').text());
    console.log('Cards or rows found:', $('.train-card, .list-item, tr').length);
    let htmlSnippet = '';
    $('.train-card, .list-item, tr').slice(0, 2).each((i, el) => {
       htmlSnippet += $(el).text().replace(/\s+/g, ' ') + '\n';
    });
    console.log('Snippet:', htmlSnippet);
}
