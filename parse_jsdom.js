const { JSDOM, VirtualConsole, CookieJar } = require('jsdom');

const log = console.log;
console.log = function() {}; // suppress jsdom noise

;(async () => {
  try {
    const virtualConsole = new VirtualConsole();
    // Ignore jsdom inner loop errors
    virtualConsole.on("error", () => { });
    virtualConsole.on("jsdomError", () => { });
    
    const cookieJar = new CookieJar();

    log('Loading JSDOM with spoofed browser properties...');
    const dom = await JSDOM.fromURL('https://etrain.info/trains/NDLS-to-BCT', {
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole,
      cookieJar,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    });
    
    log('Document loaded. Waiting for AJAX...');
    
    // Polyfill anything missing
    dom.window.localStorage = { getItem: () => null, setItem: () => {} };
    dom.window.sessionStorage = { getItem: () => null, setItem: () => {} };

    setTimeout(() => {
      const trainlist = dom.window.document.querySelector('.trainlist');
      if (trainlist) {
         log('JSDOM Success! Train list rows:', dom.window.document.querySelectorAll('.trainlist tr').length);
         let txt = dom.window.document.querySelector('.trainlist tr:nth-child(2)').textContent.replace(/\n/g, ' ').replace(/\s+/g, ' ');
         log('Sample Row:', txt);
      } else {
         log('JSDOM failed to render the trainlist table. Check if the page is completely blocked.');
         // print Title to see if it's Cloudflare "Just a moment..."
         log('Title:', dom.window.document.title);
      }
      process.exit(0);
    }, 6000);

  } catch (err) {
    log('Outer Error:', err.message);
    process.exit(1);
  }
})();
