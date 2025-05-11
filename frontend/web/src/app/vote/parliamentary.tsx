'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { t } from 'i18next';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  constituency?: string;
  electionId: string;
}

export default function ParliamentaryVotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/candidates?position=PARLIAMENTARY').then(res => setCandidates(res.data));
  }, []);

  const handleVote = async () => {
    if (!selected) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.post('/api/votes/cast', { candidateId: selected.id, electionId: selected.electionId });
      setMessage('Vote cast successfully!');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('vote.error'));
      }
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Parliamentary Candidates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {candidates.map(c => (
          <div key={c.id} className="bg-white rounded shadow p-4 flex flex-col items-center">
            <div className="text-lg font-semibold mb-2">{c.name}</div>
            <div className="mb-2">Party: {c.party}</div>
            <button
              className="mt-2 bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => { setSelected(c); setShowModal(true); }}
            >
              Vote
            </button>
          </div>
        ))}
      </div>
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Vote</h3>
            <p>Are you sure you want to vote for <span className="font-semibold">{selected.name}</span> ({selected.party})?</p>
            <div className="flex justify-end mt-6 space-x-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-700 text-white" onClick={handleVote} disabled={loading}>
                {loading ? 'Voting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      {message && <div className="mt-6 text-center text-blue-700 font-semibold">{message}</div>}
      {error && <div className="mt-6 text-center text-red-700 font-semibold">{error}</div>}
    </div>
  );
} 