import { Pie } from 'react-chartjs-2';

const COLORS = {
  Pending: '#d97706',
  Assigned: '#2563eb',
  'In Progress': '#7c3aed',
  Resolved: '#059669',
  Closed: '#64748b',
  Rejected: '#dc2626',
};

export default function StatusPieChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.status),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => COLORS[d.status] || '#94a3b8'),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, padding: 16, font: { size: 12 } } },
    },
  };

  return (
    <div className="h-72">
      <Pie data={chartData} options={options} />
    </div>
  );
}
