(async () => {
  try {
    // 1. Login
    const loginRes = await fetch('https://agenticai-backend-xao9.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@agenticai.dev', password: 'Demo@1234' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.data.token;
    console.log('Logged in, got token');

    // 2. Create Order
    const orderRes = await fetch('https://agenticai-backend-xao9.onrender.com/api/billing/paypal/create-order', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amountUSD: 10 })
    });
    const orderData = await orderRes.text();
    console.log('STATUS:', orderRes.status);
    console.log('RESPONSE:', orderData);
  } catch (err) {
    console.error(err);
  }
})();
