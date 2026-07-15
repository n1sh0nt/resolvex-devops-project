import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  History,
  UserCog,
  Building2,
  MessageSquareText,
  ScrollText,
  Settings,
  User,
  X,
} from 'lucide-react';

const navByRole = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/complaints/new', label: 'Submit Complaint', icon: FilePlus2 },
    { to: '/complaints', label: 'Complaint History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  faculty: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/complaints/new', label: 'Submit Complaint', icon: FilePlus2 },
    { to: '/complaints', label: 'Complaint History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  staff: [
    { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/complaints', label: 'Assigned Complaints', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/complaints', label: 'All Complaints', icon: History },
    { to: '/admin/users', label: 'Manage Users', icon: UserCog },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/feedback', label: 'Feedback', icon: MessageSquareText },
    { to: '/admin/activity-logs', label: 'Activity Logs', icon: ScrollText },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ],
};

export default function Sidebar({ role, mobileOpen, onClose }) {
  const items = navByRole[role] || navByRole.student;

  const content = (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-ink-800 text-white'
                : 'text-ink-600 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800'
            }`
          }
        >
          <item.icon size={18} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-100 bg-white pt-6 dark:border-ink-800 dark:bg-ink-900 md:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white pt-6 shadow-xl dark:bg-ink-900">
            <div className="flex items-center justify-between px-4 pb-4">
              <span className="font-display text-base font-bold text-ink-900 dark:text-white">Menu</span>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink-50 dark:hover:bg-ink-800">
                <X size={18} />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
