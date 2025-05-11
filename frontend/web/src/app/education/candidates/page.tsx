'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency?: string;
}

const positions = [
  { value: '', label: 'All' },
  { value: 'PRESIDENTIAL', label: 'President' },
  { value: 'PARLIAMENTARY', label: 'Parliamentary' },
  { value: 'COUNCILLOR', label: 'Councillor' },
];

export default function EducationCandidatesPage() {
  const { t, i18n } = useTranslation();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/candidates').then(res => setCandidates(res.data)).finally(() => setLoading(false));
  }, []);

  const filtered = position ? candidates.filter(c => c.position === position) : candidates;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">{t('education.candidates.title', 'Election Candidates')}</h2>
        <div className="flex gap-2 items-center">
          <select className="border rounded p-2" value={position} onChange={e => setPosition(e.target.value)}>
            {positions.map(p => <option key={p.value} value={p.value}>{t(`education.candidates.position.${p.value || 'all'}`, p.label)}</option>)}
          </select>
          <button onClick={() => i18n.changeLanguage('en')} className="ml-2">EN</button>
          <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
        </div>
      </div>
      {loading ? <div>{t('education.candidates.loading', 'Loading...')}</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-3xl text-gray-400">👤</div>
              <div className="font-bold text-lg mb-1">{c.name}</div>
              <div className="mb-1">{t(`education.candidates.party`, 'Party')}: {c.party}</div>
              <div className="mb-1">{t(`education.candidates.position.${c.position.toLowerCase()}`, c.position)}</div>
              {c.constituency && <div className="mb-1">{t('education.candidates.constituency', 'Constituency')}: {c.constituency}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 