import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, PlusCircle } from 'lucide-react';
import { complaintApi } from '../api/endpoints';
import StatCard from '../components/common/StatCard';
import ComplaintCard from '../components/complaints/ComplaintCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintApi
      .myStats()
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-ink-500">Here's what's happening with your complaints.</p>
        </div>
        <Link to="/complaints/new" className="btn-accent">
          <PlusCircle size={16} /> Submit complaint
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total complaints" value={stats?.total ?? 0} icon={FileText} accent="ink" />
        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} accent="amber" />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle2} accent="emerald" />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recent complaints</h2>
          <Link to="/complaints" className="text-sm font-medium text-brass-500 hover:text-brass-600">
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {stats?.recent?.length ? (
            stats.recent.map((c) => <ComplaintCard key={c._id} complaint={c} />)
          ) : (
            <EmptyState
              icon={FileText}
              title="No complaints yet"
              message="Submit your first complaint to start tracking it here."
              action={
                <Link to="/complaints/new" className="btn-accent">
                  <PlusCircle size={16} /> Submit complaint
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
