'use client';
import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VOTER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/register', { name, phone, nationalId, password, role });
      // handle success (e.g., redirect, show message)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('register.error'));
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
      <h2 className="text-2xl font-bold mb-4">{t('register.title', 'Register')}</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block mb-1">{t('register.name', 'Full Name')}</label>
          <input type="text" className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('register.phone', 'Phone Number')}</label>
          <input type="text" className="w-full border rounded p-2" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('register.nationalId', 'National ID')}</label>
          <input type="text" className="w-full border rounded p-2" value={nationalId} onChange={e => setNationalId(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('register.password', 'Password')}</label>
          <input type="password" className="w-full border rounded p-2" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">{t('register.role', 'Role')}</label>
          <select className="w-full border rounded p-2" value={role} onChange={e => setRole(e.target.value)}>
            <option value="VOTER">{t('register.voter', 'Voter')}</option>
            <option value="ADMIN">{t('register.admin', 'Admin')}</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded" disabled={loading}>
          {loading ? t('register.loading', 'Registering...') : t('register.submit', 'Register')}
        </button>
      </form>
    </div>
  );
} 