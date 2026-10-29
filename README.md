# Manoranjan – Money Saving & Expense Tracker

Track daily expenses, income, and savings with UPI payment support. Backup data to Google Drive.

## Features

- **Login** – Sign in with Google, Gmail, or phone number
- **Daily / Monthly / Yearly savings** – View savings across all time periods
- **User-set savings goals** – Add your own targets (Set goal on each card)
- **Expense, Income & Savings** – Log all transaction types
- **UPI payment tagging** – Mark transactions as UPI (GPay, PhonePe, Paytm), Cash, Card, or Bank Transfer
- **Save to Drive** – Export backup and open Google Drive for cloud storage
- **Import / Export** – Restore from backup or download JSON backup
- **Responsive design** – Works on desktop and mobile

## How to Use

1. Open `login.html` in a web browser to sign in.
2. Use **Continue with Google** or **Continue with Gmail** (demo mode works without setup), or enter phone number + OTP.
3. Add transactions (expense, income, or savings) with amount, description, payment method, and date.
4. Click **Set goal** on any savings card to add your target amount.
5. Use UPI option when logging payments made via GPay, PhonePe, Paytm, etc.
4. View Today’s, Monthly, and Yearly savings on the dashboard.
6. Use **Save to Drive** to download a backup and open Google Drive for uploading.
7. Use **Import** to restore from a previous backup.

## Files

- `login.html` – Login page (entry point)
- `index.html` – Main app page
- `styles.css` – Styling
- `app.js` – Logic and calculations
- `auth.js` – Login and session handling
- `login.css` – Login page styles

## Note on UPI Integration

Real-time UPI transaction import requires bank/aggregator APIs or Account Aggregator (RBI). This app uses **manual entry** with UPI as a payment method so you can log UPI transactions as you make them.
