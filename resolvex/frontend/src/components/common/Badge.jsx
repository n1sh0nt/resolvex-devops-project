import { STATUS_STYLES, PRIORITY_STYLES } from '../../utils/constants';

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge ${PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-600'}`}>
      {priority}
    </span>
  );
}
