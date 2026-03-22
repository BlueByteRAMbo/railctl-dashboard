const irctc = require('irctc-connect');

(async () => {
  try {
    console.log('Testing searchTrainBetweenStations...');
    const result = await irctc.searchTrainBetweenStations('NDLS', 'MMCT');
    console.log('Result type:', typeof result);
    console.log(JSON.stringify(result, null, 2).substring(0, 1000));
  } catch (err) {
    console.error('Error:', err);
  }
})();
