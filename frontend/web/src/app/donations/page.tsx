'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

function DonationForm() {
  const { t, i18n } = useTranslation();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TZS');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; message: string; success: boolean }>({ open: false, message: '', success: false });
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setModal({ open: false, message: '', success: false });
    const token = localStorage.getItem('token');
    const data = { amount: parseFloat(amount), currency, phone: '' };
    // Optionally collect phone for metadata
    if (navigator.onLine) {
      try {
        const res = await axios.post('/api/donations', data, { headers: { Authorization: `Bearer ${token}` } });
        const clientSecret = res.data.clientSecret;
        if (!stripe || !elements) throw new Error('Stripe not loaded');
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: elements.getElement(CardElement)! },
        });
        if (result.error) {
          setModal({ open: true, message: result.error.message || t('donations.error', 'Payment failed.'), success: false });
        } else if (result.paymentIntent?.status === 'succeeded') {
          setModal({ open: true, message: t('donations.success', 'Payment successful!'), success: true });
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setModal({ open: true, message: err.response?.data?.message || t('donations.error', 'Payment failed.'), success: false });
        }
      }
    } else {
      // Offline: queue in localStorage
      const queue = JSON.parse(localStorage.getItem('donationQueue') || '[]');
      queue.push(data);
      localStorage.setItem('donationQueue', JSON.stringify(queue));
      setModal({ open: true, message: t('donations.queued', 'Donation queued for sync.'), success: true });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-end mb-4">
        <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
        <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
      </div>
      <h2 className="text-2xl font-bold mb-4">{t('donations.title', 'Donate')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">{t('donations.amount', 'Amount')}</label>
          <input type="number" min="1" className="w-full border rounded p-2" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('donations.currency', 'Currency')}</label>
          <select className="w-full border rounded p-2" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="TZS">TZS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">{t('donations.card', 'Card Details')}</label>
          <div className="border rounded p-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-700">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded" disabled={loading}>
          {loading ? t('donations.loading', 'Processing...') : t('donations.submit', 'Donate')}
        </button>
      </form>
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
            <h3 className={`text-lg font-bold mb-4 ${modal.success ? 'text-green-600' : 'text-red-600'}`}>{modal.success ? t('donations.successTitle', 'Payment Successful') : t('donations.errorTitle', 'Payment Failed')}</h3>
            <p>{modal.message}</p>
            <button className="mt-6 px-4 py-2 rounded bg-blue-700 text-white" onClick={() => setModal({ ...modal, open: false })} autoFocus>
              {t('donations.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DonationsPage() {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm />
    </Elements>
  );
} 