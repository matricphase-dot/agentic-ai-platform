const Razorpay = require('./backend/node_modules/razorpay');
const rzp = new Razorpay({
  key_id: 'rzp_live_SlC9oFgIO6E4iy',
  key_secret: 'luBbo7eVnVFJTHBuYAkzxIUk'
});
(async () => {
  try {
    const order = await rzp.orders.create({
      amount: 10000, // 100 INR
      currency: 'INR',
      receipt: 'test_receipt_123'
    });
    console.log('SUCCESS!', order);
  } catch (err) {
    console.error('FAILED!', err);
  }
})();
