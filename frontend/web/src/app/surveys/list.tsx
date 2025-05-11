'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface Survey {
  id: string;
  title: string;
  createdAt: string;
}

export default function SurveyListPage() {
  const { t, i18n } = useTranslation();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/surveys', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSurveys(res.data))
      .catch(() => setError(t('surveys.error', 'Failed to load surveys.')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('surveys.title', 'Available Surveys')}</h2>
        <div>
          <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
          <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
        </div>
      </div>
      {loading ? <div>{t('surveys.loading', 'Loading...')}</div> : error ? <div className="text-red-500">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded shadow text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">{t('surveys.table.title', 'Title')}</th>
                <th className="p-2 text-left">{t('surveys.table.date', 'Date')}</th>
                <th className="p-2">{t('surveys.table.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.title}</td>
                  <td className="p-2">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 text-center">
                    <Link href={`/surveys/${s.id}`} className="bg-blue-700 text-white px-3 py-1 rounded">
                      {t('surveys.table.take', 'Take Survey')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 