import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARD_PATH } from '../../utils/constants';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicNavbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 font-display text-lg font-bold text-brass-300">
            R
          </span>
          <span className="font-display text-lg font-bold text-ink-900">ResolveX</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-800'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to={ROLE_DASHBOARD_PATH[user.role]} className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-accent">
                Register
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-paper px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-700">
                {l.label}
              </NavLink>
            ))}
            <hr className="border-ink-100" />
            {user ? (
              <Link to={ROLE_DASHBOARD_PATH[user.role]} onClick={() => setOpen(false)} className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-accent">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
