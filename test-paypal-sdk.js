const PAYPAL_CLIENT_ID = 'ATzN4HypBBqHLV-gTUdguwwmoeejltZ8dmm-SJN-HrGymtsKdul2oaoYF8z8fOkdDkYHap-DQy00qUt1';
const PAYPAL_CLIENT_SECRET = 'EE5mDYyD2yZ9eYzH5UWfMMmAwHEJXWepAwMwosoTohhepNL3jobgJedG8TRujNRY78vl0FwFzWAAalnT';
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // sandbox mode

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

(async () => {
  try {
    const accessToken = await getAccessToken();
    console.log('Got Access Token:', accessToken.slice(0, 10) + '...');
    
    const amountUSD = 10;
    const userId = 'test_user_123';
    
    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amountUSD.toString(),
          },
          description: `Credit Top-up for ${userId}`,
        }],
      }),
    });

    const order = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(order));
    
    console.log('SUCCESS!', order.id);
  } catch (err) {
    console.error('FAILED!', err);
  }
})();
