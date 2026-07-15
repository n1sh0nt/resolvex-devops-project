import { useEffect, useState } from 'react';
import { Star, MessageSquareText } from 'lucide-react';
import { feedbackApi } from '../../api/endpoints';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { format } from 'date-fns';

export default function AdminFeedbackPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedbackApi
      .list()
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
          <h1 className="text-2xl font-bold text-ink-900">Feedback</h1>
          <p className="mt-1 text-sm text-ink-500">What complainants are saying about resolutions.</p>
        </div>
        <div className="card flex items-center gap-2 px-4 py-2.5">
          <Star size={18} className="fill-brass-400 text-brass-400" />
          <span className="text-lg font-bold text-ink-900">{data.averageRating}</span>
          <span className="text-sm text-ink-400">/ 5 average</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.feedback.length === 0 ? (
          <EmptyState icon={MessageSquareText} title="No feedback yet" message="Feedback will appear here once complaints are resolved and rated." />
        ) : (
          data.feedback.map((f) => (
            <div key={f._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{f.complaint?.title}</p>
                  <p className="text-xs text-ink-400">
                    {f.complaint?.ticketId} · {f.complaint?.department?.name || 'Unassigned'} · by {f.submittedBy?.name}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} className={n <= f.rating ? 'fill-brass-400 text-brass-400' : 'text-ink-200'} />
                  ))}
                </div>
              </div>
              {f.comment && <p className="mt-2 text-sm text-ink-600">"{f.comment}"</p>}
              <p className="mt-2 text-xs text-ink-300">{format(new Date(f.createdAt), 'MMM d, yyyy')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
