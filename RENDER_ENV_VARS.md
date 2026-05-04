# Render Environment Variables

## FREE TIER SETUP (Start here - $0/month)

## FREE LLM Setup (Zero Cost)

### Step 1 - Groq (Primary - Fastest)
1. Go to console.groq.com
2. Sign up free - no credit card
3. Create API Key
4. Copy key starting with gsk_...
5. Add to Render: GROQ_API_KEY=gsk_...
6. Get 2 more free keys for rotation:
   GROQ_API_KEY_2=gsk_...
   GROQ_API_KEY_3=gsk_...
Free quota: 14,400 requests/day per key
With 3 keys: 43,200 requests/day FREE

### Step 2 - Hugging Face (Fallback)  
1. Go to huggingface.co
2. Sign up free
3. Settings → Access Tokens → New Token (read)
4. Add to Render: HF_API_KEY=hf_...
Free quota: Generous free tier

### That's it - Platform runs 100% free
No credit card. No billing alerts. No surprise charges.

### Step 2: Get Resend API Key (FREE)
1. Go to [resend.com](https://resend.com)
2. Sign up free (no credit card)
3. Go to **API Keys** → **Create API Key**
4. Copy the key starting with `"re_..."`
5. Add to Render: `RESEND_API_KEY=re_...`
6. Also add these Render env vars:
   - `SMTP_HOST=smtp.resend.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=resend`
   - `SMTP_PASS=same_as_RESEND_API_KEY`
   - `SMTP_FROM=onboarding@resend.dev`

*That's it - platform is fully functional for free.*

---

Copy and paste these into the Render dashboard for each service.

## BACKEND SERVICE ENV VARS
`agenticai-backend`

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `4000` | |
| `JWT_SECRET` | `2b3619fa2b1f9d26763cca454dd66b46c19983eb5ca6a47bdc98065dabdc5548` | Generated |
| `JWT_EXPIRES_IN` | `7d` | |
| `ENCRYPTION_KEY` | `a280a45df8dae58fac2a3db1473858f9e616d855962dad3a5041653fb049faf9` | Generated |
| `FRONTEND_URL` | `https://agenticai-frontend.onrender.com` | |
| `DATABASE_URL` | `[PASTE_FROM_RENDER_POSTGRES]` | Internal Database URL |
| `REDIS_URL` | `[PASTE_FROM_RENDER_REDIS]` | Internal Redis URL |
| `SMTP_HOST` | `smtp.gmail.com` | |
| `SMTP_PORT` | `587` | |
| `SMTP_SECURE` | `false` | |
| `SMTP_USER` | `YOUR_GMAIL` | Replace with yours |
| `SMTP_PASS` | `YOUR_APP_PASSWORD` | Replace with yours |
| `SMTP_FROM` | `noreply@agenticai.dev` | |
| `PLATFORM_FEE_PERCENT` | `20` | |
| `STAKER_REWARD_PERCENT` | `30` | |
| `INTERNAL_CRON_SECRET` | `097ca16c4a3ee5441335369f7b26d2f1` | Generated |
| `ADMIN_EMAIL` | `admin@agenticai.dev` | |
| `ADMIN_PASSWORD` | `Demo@1234` | Change as needed |
| `GROQ_API_KEY` | `gsk_...` | Primary Free LLM (Critical) |
| `GROQ_API_KEY_2` | `gsk_...` | Optional: 2nd key for rotation |
| `GROQ_API_KEY_3` | `gsk_...` | Optional: 3rd key for rotation |
| `HF_API_KEY` | `hf_...` | Hugging Face fallback (Critical) |
| `OLLAMA_URL` | `http://...` | Optional: Self-hosted Ollama |
| `GOOGLE_AI_API_KEY` | `AIza...` | Optional fallback |
| `OPENAI_API_KEY` | `sk-...` | Optional fallback provider |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Optional fallback provider |
| `RESEND_API_KEY` | `re_...` | Primary email service (Critical) |
| `SMTP_HOST` | `smtp.gmail.com` | Optional email fallback host |
| `SMTP_PORT` | `587` | |
| `SMTP_SECURE` | `false` | |
| `SMTP_USER` | `YOUR_GMAIL` | Replace with yours |
| `SMTP_PASS` | `YOUR_APP_PASSWORD` | Replace with yours |
| `RAZORPAY_KEY_ID` | `rzp_...` | For Razorpay billing |
| `RAZORPAY_KEY_SECRET` | `...` | For Razorpay billing |
| `RAZORPAY_WEBHOOK_SECRET` | `...` | Webhook verification |
| `PAYPAL_CLIENT_ID` | `...` | For PayPal billing |
| `PAYPAL_CLIENT_SECRET` | `...` | For PayPal billing |
| `PAYPAL_MODE` | `sandbox` | `sandbox` or `live` |
| `AGNT_TOKEN_ADDRESS` | `0x...` | Blockchain token |
| `STAKING_CONTRACT_ADDRESS` | `0x...` | Smart contract |
| `GOVERNANCE_CONTRACT_ADDRESS` | `0x...` | Smart contract |
| `NODE_REWARDS_CONTRACT_ADDRESS` | `0x...` | Smart contract |
| `TREASURY_CONTRACT_ADDRESS` | `0x...` | Smart contract |
| `BLOCKCHAIN_RPC_URL` | `https://rpc-mumbai.maticvigil.com` | Polygon RPC |
| `BACKEND_WALLET_PRIVATE_KEY` | `0x...` | Admin wallet |

## FRONTEND SERVICE ENV VARS
`agenticai-frontend`

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://agenticai-backend.onrender.com` | |
| `NEXT_PUBLIC_WS_URL` | `https://agenticai-backend.onrender.com` | |

---

## Generation Commands
If you want to generate new secrets, run these in your terminal:

**JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**ENCRYPTION_KEY:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**INTERNAL_CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
