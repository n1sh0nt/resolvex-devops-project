import { useEffect, useState } from 'react';
import { Users, FileText, Star, TrendingUp, Download, FileSpreadsheet } from 'lucide-react';
import '../../utils/chartSetup';
import { analyticsApi } from '../../api/endpoints';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import StatusPieChart from '../../components/charts/StatusPieChart';
import DepartmentBarChart from '../../components/charts/DepartmentBarChart';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .adminDashboard()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Admin dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">A live view of complaint activity across campus.</p>
        </div>
        <div className="flex gap-2">
          <a href={analyticsApi.exportExcelUrl()} className="btn-outline">
            <FileSpreadsheet size={15} /> Excel
          </a>
          <a href={analyticsApi.exportPdfUrl()} className="btn-outline">
            <Download size={15} /> PDF
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={data.totalUsers} icon={Users} accent="ink" />
        <StatCard label="Total complaints" value={data.totalComplaints} icon={FileText} accent="brass" />
        <StatCard label="Avg. feedback rating" value={`${data.averageFeedbackRating || 0} / 5`} icon={Star} accent="amber" />
        <StatCard
          label="Resolved this period"
          value={data.statusBreakdown.find((s) => s.status === 'Resolved')?.count || 0}
          icon={TrendingUp}
          accent="emerald"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Monthly complaint trend</h2>
          <div className="mt-4">
            {data.monthlyTrend.length ? (
              <MonthlyTrendChart data={data.monthlyTrend} />
            ) : (
              <p className="py-10 text-center text-sm text-ink-400">Not enough data yet.</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink-900">Status breakdown</h2>
          <div className="mt-4">
            {data.statusBreakdown.length ? (
              <StatusPieChart data={data.statusBreakdown} />
            ) : (
              <p className="py-10 text-center text-sm text-ink-400">Not enough data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-5 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Most active departments</h2>
        <div className="mt-4">
          {data.departmentBreakdown.length ? (
            <DepartmentBarChart data={data.departmentBreakdown} />
          ) : (
            <p className="py-10 text-center text-sm text-ink-400">No department activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
