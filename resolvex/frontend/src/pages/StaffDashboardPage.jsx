import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, Loader as LoaderIcon, CheckCircle2 } from 'lucide-react';
import { analyticsApi } from '../api/endpoints';
import StatCard from '../components/common/StatCard';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .departmentDashboard()
      .then(({ data }) => setStats(data))
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
      <h1 className="text-2xl font-bold text-ink-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-ink-500">Here's the current workload for your department.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total assigned" value={stats?.assigned ?? 0} icon={ClipboardList} accent="ink" />
        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} accent="amber" />
        <StatCard label="In progress" value={stats?.inProgress ?? 0} icon={LoaderIcon} accent="blue" />
        <StatCard label="Completed" value={stats?.completed ?? 0} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="card mt-8 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-900">Ready to work the queue?</h2>
          <p className="mt-1 text-sm text-ink-500">Review assigned complaints, update statuses, and add resolution notes.</p>
        </div>
        <Link to="/complaints" className="btn-primary shrink-0">
          View assigned complaints
        </Link>
      </div>
    </div>
  );
}
