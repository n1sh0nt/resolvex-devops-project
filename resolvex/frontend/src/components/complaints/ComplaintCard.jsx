import { Link } from 'react-router-dom';
import { MapPin, Clock, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge, PriorityBadge } from '../common/Badge';

export default function ComplaintCard({ complaint }) {
  return (
    <Link
      to={`/complaints/${complaint._id}`}
      className="card flex flex-col gap-3 p-4 transition hover:border-brass-300 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-brass-500">{complaint.ticketId}</span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h3 className="mt-1.5 truncate text-sm font-semibold text-ink-900">{complaint.title}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <span>{complaint.category}</span>
          {complaint.department?.name && <span>{complaint.department.name}</span>}
          {complaint.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {complaint.location}
            </span>
          )}
          {complaint.images?.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={12} /> {complaint.images.length}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Link>
  );
}
