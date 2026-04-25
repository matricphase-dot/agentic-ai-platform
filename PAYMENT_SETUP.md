# Payment Setup Guide (Razorpay & PayPal)

Follow these steps to activate credits top-up for your Agentic AI Platform.

## 1. Razorpay Setup (Indian Payments: UPI, Cards, Netbanking)

1.  **Sign Up**: Go to [razorpay.com](https://razorpay.com) and create a free account.
2.  **API Keys**:
    *   Navigate to **Settings** → **API Keys**.
    *   Click **Generate Test Key**.
    *   Copy the `Key ID` (starts with `rzp_test_...`) and `Key Secret`.
3.  **Configure Environment**:
    *   **Backend (Render)**:
        *   `RAZORPAY_KEY_ID=rzp_test_...`
        *   `RAZORPAY_KEY_SECRET=...`
    *   **Frontend (Render)**:
        *   `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...`
4.  **Webhooks (Optional but Recommended)**:
    *   Go to **Settings** → **Webhooks**.
    *   Add URL: `https://your-backend-url.onrender.com/api/webhooks/billing/razorpay`
    *   Events: `payment.captured`
    *   Secret: Create one and add to backend as `RAZORPAY_WEBHOOK_SECRET`.

## 2. PayPal Setup (International Payments: USD)

1.  **Sign Up**: Go to [developer.paypal.com](https://developer.paypal.com) and log in with your PayPal account.
2.  **Create App**:
    *   Go to **Apps & Credentials**.
    *   Click **Create App**.
    *   Name it "AgenticAI".
    *   Copy the `Client ID` and `Secret`.
3.  **Configure Environment**:
    *   **Backend (Render)**:
        *   `PAYPAL_CLIENT_ID=...`
        *   `PAYPAL_CLIENT_SECRET=...`
        *   `PAYPAL_MODE=sandbox` (Change to `live` for production)
    *   **Frontend (Render)**:
        *   `NEXT_PUBLIC_PAYPAL_CLIENT_ID=...`

## 3. Going Live

1.  **Razorpay**: Complete the KYC on the Razorpay dashboard. Once approved, switch to **Live Mode** and generate new Live Keys. Update your environment variables.
2.  **PayPal**: Switch your App from **Sandbox** to **Live** in the PayPal Developer Dashboard. Update your environment variables and change `PAYPAL_MODE` to `live`.

## 4. Credit Conversion Rates

*   **Indian Users**: ₹1 = 1 Credit
*   **International Users**: $1 = 100 Credits
*   **Usage**: Credits are deducted for agent invocations (usually 1 credit per call for FREE agents, or tokens equivalent for paid agents).
