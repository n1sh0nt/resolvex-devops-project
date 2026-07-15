import { Bar } from 'react-chartjs-2';

export default function DepartmentBarChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Complaints',
        data: data.map((d) => d.count),
        backgroundColor: '#294c78',
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#eef2f7' } },
      y: { grid: { display: false } },
    },
  };

  return (
    <div style={{ height: Math.max(200, data.length * 44) }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
