import { checkPNRStatus } from 'irctc-connect';

async function test() {
  const res = await checkPNRStatus('2145678901');
  console.log(JSON.stringify(res, null, 2));
}

test();
