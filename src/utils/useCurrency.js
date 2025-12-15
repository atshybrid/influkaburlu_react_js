import { useEffect, useState } from 'react';

// Always use Indian Rupees across the app.
export function useCurrency() {
  const [currency, setCurrency] = useState({ code: 'INR', symbol: '₹' });
  useEffect(() => {
    // No geo lookup; we lock to INR.
    setCurrency({ code: 'INR', symbol: '₹' });
  }, []);
  return currency;
}

// Format amounts as INR. If values come as USD, convert with a simple static rate.
export function formatPrice(amount, currency, { assumesUSD = false } = {}) {
  const code = currency?.code || 'INR';
  const symbol = currency?.symbol || '₹';
  let value = Number(amount) || 0;
  if (assumesUSD && code === 'INR') {
    const rate = 83; // approx INR per USD
    value = Math.round(value * rate);
  }
  return `${symbol}${value.toLocaleString('en-IN')}`;
}
