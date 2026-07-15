import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, Sun, LogOut, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationApi } from '../../api/endpoints';
import { ROLE_LABELS } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const { data } = await notificationApi.list({ limit: 8 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      /* silent - non-critical widget */
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    loadNotifications();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-900/90 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 hover:bg-ink-50 dark:hover:bg-ink-800 md:hidden">
          <Menu size={20} />
        </button>
        <Link to="/" className="hidden items-center gap-2 md:flex">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 font-display text-sm font-bold text-brass-300">
            R
          </span>
          <span className="font-display text-base font-bold text-ink-900 dark:text-white">ResolveX</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-ink-500 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-rejected px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl2 border border-ink-100 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
                <p className="text-sm font-semibold text-ink-900 dark:text-white">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-medium text-brass-500 hover:text-brass-600">
                    <Check size={13} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-ink-400">You're all caught up.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`border-b border-ink-50 px-4 py-3 last:border-0 dark:border-ink-800 ${
                        !n.isRead ? 'bg-brass-50/50 dark:bg-ink-800/50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{n.message}</p>
                      <p className="mt-1 text-[11px] text-ink-300">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1.5 pl-2 hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 text-sm font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-100">
              {user?.name?.[0]?.toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-ink-800 dark:text-ink-100">{user?.name}</span>
              <span className="block text-xs text-ink-400">{ROLE_LABELS[user?.role]}</span>
            </span>
            <ChevronDown size={15} className="hidden text-ink-400 sm:block" />
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl2 border border-ink-100 bg-white py-1.5 shadow-2xl dark:border-ink-800 dark:bg-ink-900">
              <Link to="/profile" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">
                Profile
              </Link>
              <Link to="/settings" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-status-rejected hover:bg-red-50 dark:hover:bg-ink-800"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
