const cheerio = require('cheerio');
const fs = require('fs');

const txt = fs.readFileSync('C:\\Users\\LDCN7492\\tmp\\etrain_trains.html', 'utf16le');
const $ = cheerio.load(txt);

console.log('Title:', $('title').text());

const trainBlocks = $('.trainlist > tbody > tr, .trainlist tr, table tr');
console.log('Train rows found via selectors:', trainBlocks.length);

const idx = txt.indexOf('12952');
if (idx !== -1) {
    console.log('Found 12952 near:');
    console.log(txt.substring(Math.max(0, idx - 100), idx + 200).replace(/\s+/g, ' '));
} else {
    console.log('No mention of 12952 in the HTML! It is dynamic.');
    
    // Look for embedded JSON or AJAX data
    const match = txt.match(/var\s+data\s*=\s*(\{.*?\});/i);
    if (match) console.log('Embedded Data:', match[1].substring(0, 100));
}
