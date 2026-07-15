import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { format } from 'date-fns';
import { adminApi } from '../../api/endpoints';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminApi
      .activityLogs({ page, limit: 20 })
      .then(({ data }) => {
        setLogs(data.logs);
        setMeta({ page: data.page, pages: data.pages, total: data.total });
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Activity logs</h1>
      <p className="mt-1 text-sm text-ink-500">A full audit trail of actions taken across the system.</p>

      <div className="card mt-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No activity yet" />
        ) : (
          <ul className="divide-y divide-ink-50">
            {logs.map((log) => (
              <li key={log._id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brass-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink-700">
                    <span className="font-semibold text-ink-900">{log.user?.name || 'System'}</span> — {log.description || log.action}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {log.action} · {format(new Date(log.createdAt), 'MMM d, yyyy · h:mm a')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
    </div>
  );
}
