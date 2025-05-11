'use client';
import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Verify2FAPage() {
  const { t, i18n } = useTranslation();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post('/api/auth/verify-2fa', { phone, code });
      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('verify2fa.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-end mb-4">
        <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
        <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
      </div>
      <h2 className="text-2xl font-bold mb-4">{t('2fa.title', 'Verify 2FA')}</h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block mb-1">{t('2fa.phone', 'Phone Number')}</label>
          <input type="text" className="w-full border rounded p-2" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('2fa.code', '2FA Code')}</label>
          <input type="text" className="w-full border rounded p-2" value={code} onChange={e => setCode(e.target.value)} required />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{t('2fa.success', 'Verification successful!')}</div>}
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded" disabled={loading}>
          {loading ? t('2fa.loading', 'Verifying...') : t('2fa.submit', 'Verify')}
        </button>
      </form>
    </div>
  );
} 