'use client';
import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { phone, password });
      // handle success (e.g., redirect, store token)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('login.error'));
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
      <h2 className="text-2xl font-bold mb-4">{t('login.title', 'Login')}</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">{t('login.phone', 'Phone Number')}</label>
          <input type="text" className="w-full border rounded p-2" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('login.password', 'Password')}</label>
          <input type="password" className="w-full border rounded p-2" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded" disabled={loading}>
          {loading ? t('login.loading', 'Logging in...') : t('login.submit', 'Login')}
        </button>
      </form>
    </div>
  );
} 