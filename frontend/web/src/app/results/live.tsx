'use client';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';
import axios from 'axios';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface VoteData {
  name: string;
  votes: number;
}

export default function LiveResultsPage() {
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial vote counts
    axios.get('/api/results/votes?electionId=all').then(res => {
      setVoteData(res.data);
      setLoading(false);
    });
    // Listen for real-time updates
    const socket = io();
    socket.on('voteUpdate', () => {
      axios.get('/api/results/votes?electionId=all').then(res => setVoteData(res.data));
    });
    return () => { socket.disconnect(); };
  }, []);

  const chartData = {
    labels: voteData.map((c) => c.name),
    datasets: [
      {
        label: 'Votes',
        data: voteData.map((c) => c.votes),
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
      },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Live Results</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      )}
    </div>
  );
} 