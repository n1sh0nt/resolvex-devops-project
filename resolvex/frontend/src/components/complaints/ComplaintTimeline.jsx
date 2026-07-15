import { format } from 'date-fns';
import { STATUS_STYLES } from '../../utils/constants';

export default function ComplaintTimeline({ timeline }) {
  return (
    <ol className="relative ml-3 border-l-2 border-ink-100">
      {timeline.map((entry, idx) => (
        <li key={idx} className="mb-6 ml-5 last:mb-0">
          <span
            className={`absolute -left-[9px] mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
              STATUS_STYLES[entry.status]?.split(' ')[0] || 'bg-ink-200'
            }`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-900">{entry.status}</span>
            <span className="text-xs text-ink-400">
              {format(new Date(entry.changedAt), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
          {entry.note && <p className="mt-0.5 text-sm text-ink-500">{entry.note}</p>}
          {entry.changedBy?.name && (
            <p className="mt-0.5 text-xs text-ink-400">by {entry.changedBy.name}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
