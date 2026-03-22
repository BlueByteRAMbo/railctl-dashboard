const fs = require('fs');
const cheerio = require('cheerio');
const txt = fs.readFileSync('C:\\Users\\LDCN7492\\tmp\\etrain_trains.html', 'utf16le');
const $ = cheerio.load(txt);

$('table').each((i, el) => {
   console.log('Table', i, 'rows:', $(el).find('tr').length, 'class:', $(el).attr('class'), 'id:', $(el).attr('id'));
   if ($(el).find('tr').length > 1) {
       console.log('  Content snippet:', $(el).text().substring(0, 150).replace(/\s+/g, ' '));
   }
});
