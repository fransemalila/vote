'use client';
import { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import io from 'socket.io-client';
import axios from 'axios';

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DemographicsData {
  ageGroups: Record<string, number>;
  genderCounts: Record<string, number>;
  regionCounts: Record<string, number>;
}

export default function DemographicsResultsPage() {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/results/demographics?electionId=all').then(res => {
      setData(res.data);
      setLoading(false);
    });
    const socket = io();
    socket.on('voteUpdate', () => {
      axios.get('/api/results/demographics?electionId=all').then(res => setData(res.data));
    });
    return () => { socket.disconnect(); };
  }, []);

  if (loading || !data) return <div className="max-w-3xl mx-auto mt-10">Loading...</div>;

  const ageChart = {
    labels: Object.keys(data.ageGroups),
    datasets: [{
      label: 'Age Groups',
      data: Object.values(data.ageGroups),
      backgroundColor: [
        '#2563eb', '#60a5fa', '#a5b4fc', '#fbbf24', '#f87171',
      ],
    }],
  };
  const genderChart = {
    labels: Object.keys(data.genderCounts),
    datasets: [{
      label: 'Gender',
      data: Object.values(data.genderCounts),
      backgroundColor: ['#2563eb', '#fbbf24', '#f87171'],
    }],
  };
  const regionChart = {
    labels: Object.keys(data.regionCounts),
    datasets: [{
      label: 'Region',
      data: Object.values(data.regionCounts),
      backgroundColor: '#60a5fa',
    }],
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-10">
      <h2 className="text-2xl font-bold mb-6">Demographics Breakdown</h2>
      <div>
        <h3 className="font-semibold mb-2">Age Groups</h3>
        <Bar data={ageChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Gender</h3>
        <Pie data={genderChart} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Region</h3>
        <Bar data={regionChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
    </div>
  );
} 