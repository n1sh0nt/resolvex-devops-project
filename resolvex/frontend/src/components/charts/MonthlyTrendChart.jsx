import { Line } from 'react-chartjs-2';

export default function MonthlyTrendChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Complaints',
        data: data.map((d) => d.count),
        borderColor: '#c89b3c',
        backgroundColor: 'rgba(200, 155, 60, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#0b1626',
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#eef2f7' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="h-72">
      <Line data={chartData} options={options} />
    </div>
  );
}
