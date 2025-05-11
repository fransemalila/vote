'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface Stats {
  turnout: Record<string, number>;
  demographics: any[];
  surveys?: any[];
  totalDonations: number;
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/admin/analytics', { headers: { Authorization: `Bearer ${token}` } });
      setStats(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const socket = io();
    socket.on('adminUpdate', fetchStats);
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('admin.dashboard.title', 'Admin Dashboard')}</h2>
        <div>
          <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
          <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
        </div>
      </div>
      {loading ? <div>{t('admin.dashboard.loading', 'Loading...')}</div> : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.turnout ? Object.values(stats.turnout).reduce((a, b) => (a as number) + (b as number), 0) : 0}</div>
            <div className="mt-2">{t('admin.dashboard.votes', 'Votes')}</div>
          </div>
          <div className="bg-green-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-green-700">{stats.demographics ? stats.demographics.length : 0}</div>
            <div className="mt-2">{t('admin.dashboard.voters', 'Voters')}</div>
          </div>
          <div className="bg-yellow-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-yellow-700">{stats.surveys ? stats.surveys.length : 0}</div>
            <div className="mt-2">{t('admin.dashboard.surveys', 'Surveys')}</div>
          </div>
          <div className="bg-purple-100 p-4 rounded shadow text-center">
            <div className="text-3xl font-bold text-purple-700">{stats.totalDonations || 0}</div>
            <div className="mt-2">{t('admin.dashboard.donations', 'Donations')}</div>
          </div>
        </div>
      )}
    </div>
  );
} 