const PRODUCTION_API = 'https://agenticai-backend-xao9.onrender.com';

export const API_URL = 
  process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API;

export const WS_URL = 
  process.env.NEXT_PUBLIC_WS_URL || PRODUCTION_API;
