'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useParams } from 'next/navigation';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Survey {
  id: string;
  title: string;
  question: string;
  options: string[];
}

interface SurveyResponse {
  id: string;
  userId: string;
  surveyId: string;
  answer: string;
}

function getRole() {
  // Example: decode JWT from localStorage to get role
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

export default function SurveyPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [syncing, setSyncing] = useState(false);
  const role = getRole();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`/api/surveys/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSurvey(res.data);
        setAnswer('');
      })
      .catch(() => setError(t('survey.error', 'Failed to load survey.')))
      .finally(() => setLoading(false));
    if (role === 'ADMIN') {
      axios.get(`/api/surveys/${id}/responses`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setResponses(res.data));
    }
    // Sync offline queue
    if (navigator.onLine) {
      const queue = JSON.parse(localStorage.getItem('surveyQueue') || '[]');
      if (queue.length > 0) {
        setSyncing(true);
        Promise.all(queue.map((item: any) =>
          axios.post(`/api/surveys/${item.id}/responses`, item.data, { headers: { Authorization: `Bearer ${token}` } })
        )).then(() => {
          localStorage.removeItem('surveyQueue');
        }).finally(() => setSyncing(false));
      }
    }
  }, [id, t, role]);

  const handleChange = (value: string) => {
    setAnswer(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    const data = { answer };
    if (navigator.onLine) {
      try {
        await axios.post(`/api/surveys/${id}/responses`, data, { headers: { Authorization: `Bearer ${token}` } });
        setSuccess(t('survey.success', 'Response submitted!'));
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || t('survey.submitError', 'Failed to submit response.'));
        }
      }
    } else {
      // Offline: queue in localStorage
      const queue = JSON.parse(localStorage.getItem('surveyQueue') || '[]');
      queue.push({ id, data });
      localStorage.setItem('surveyQueue', JSON.stringify(queue));
      setSuccess(t('survey.queued', 'Response queued for sync.'));
    }
  };

  // Admin: aggregate responses for chart
  let chartData = null;
  if (role === 'ADMIN' && survey && responses.length > 0) {
    const optionCounts: Record<string, number> = {};
    survey.options.forEach(opt => { optionCounts[opt] = 0; });
    responses.forEach(r => {
      if (optionCounts[r.answer] !== undefined) optionCounts[r.answer]++;
    });
    chartData = {
      labels: Object.keys(optionCounts),
      datasets: [{
        label: survey.question,
        data: Object.values(optionCounts),
        backgroundColor: '#2563eb',
      }],
    };
  }

  if (loading) return <div className="max-w-2xl mx-auto mt-10">{t('survey.loading', 'Loading...')}</div>;
  if (error) return <div className="max-w-2xl mx-auto mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{survey?.title}</h2>
        <div>
          <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
          <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="Survey Form">
        {survey && (
          <div className="mb-4">
            <label className="block font-semibold mb-2">{survey.question}</label>
            {survey.options && survey.options.length > 0 ? (
              <div role="radiogroup" aria-labelledby={`q0`}>
                {survey.options.map((opt, oidx) => (
                  <label key={oidx} className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      name={`q0`}
                      value={opt}
                      checked={answer === opt}
                      onChange={() => handleChange(opt)}
                      className="mr-2"
                      aria-checked={answer === opt}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                className="w-full border rounded p-2"
                value={answer}
                onChange={e => handleChange(e.target.value)}
                aria-label={survey.question}
              />
            )}
          </div>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded" aria-label="Submit Survey">
          {t('survey.submit', 'Submit')}
        </button>
        {syncing && <div className="text-blue-600 text-sm mt-2">{t('survey.syncing', 'Syncing offline responses...')}</div>}
      </form>
      {role === 'ADMIN' && chartData && (
        <div className="mt-10">
          <h3 className="font-semibold mb-2">{t('survey.chart', 'Aggregated Responses')}</h3>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
        </div>
      )}
    </div>
  );
} 