(async () => {
  const res = await fetch('https://agenticai-backend-xao9.onrender.com/api/marketplace', {
    method: 'GET'
  });
  const data = await res.text();
  console.log('STATUS:', res.status);
  console.log('DATA:', data);
})();
