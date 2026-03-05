import { distributeNodeRewards } from './nodeRewards';

distributeNodeRewards()
  .then(() => {
    console.log('? Rewards distributed.');
    process.exit(0);
  })
  .catch((err: any) => {
    console.error('? Error:', err);
    process.exit(1);
  });












