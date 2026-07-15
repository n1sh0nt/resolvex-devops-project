export const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Internet',
  'Classroom',
  'Laboratory',
  'Hostel',
  'Library',
  'Sports',
  'Security',
  'Cleanliness',
  'Water Supply',
  'Others',
];

export const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-status-pending border border-amber-200',
  Assigned: 'bg-blue-50 text-status-assigned border border-blue-200',
  'In Progress': 'bg-violet-50 text-status-progress border border-violet-200',
  Resolved: 'bg-emerald-50 text-status-resolved border border-emerald-200',
  Closed: 'bg-slate-100 text-status-closed border border-slate-200',
  Rejected: 'bg-red-50 text-status-rejected border border-red-200',
};

export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-50 text-blue-600',
  High: 'bg-amber-50 text-amber-700',
  Urgent: 'bg-red-50 text-red-700',
};

export const ROLE_LABELS = {
  student: 'Student',
  faculty: 'Faculty',
  staff: 'Department Staff',
  admin: 'Administrator',
};

export const ROLE_DASHBOARD_PATH = {
  student: '/dashboard',
  faculty: '/dashboard',
  staff: '/staff/dashboard',
  admin: '/admin/dashboard',
};
