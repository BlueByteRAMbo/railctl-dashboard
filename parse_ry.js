const fs = require('fs');
let txt = '';
try {
  txt = fs.readFileSync('C:\\Users\\LDCN7492\\tmp\\railyatri.html', 'utf8');
} catch(e) {
  txt = fs.readFileSync('C:\\Users\\LDCN7492\\tmp\\railyatri.html', 'utf16le');
}

console.log('RailYatri length:', txt.length);
if (txt.includes('12952')) {
  console.log('Found train 12952!');
} else {
  console.log('No train found. Might be blocked or ajax.');
}
