import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-900 text-ink-200">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-400 font-display text-sm font-bold text-ink-900">
              R
            </span>
            <span className="font-display text-base font-bold text-white">ResolveX</span>
          </div>
          <p className="mt-3 text-sm text-ink-400">
            A smart complaint management system that keeps campus issues moving from report to resolution.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Quick links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink-400">
            <Link to="/" className="hover:text-brass-300">Home</Link>
            <Link to="/about" className="hover:text-brass-300">About</Link>
            <Link to="/contact" className="hover:text-brass-300">Contact</Link>
            <Link to="/login" className="hover:text-brass-300">Log in</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Campus Support Office</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-ink-400">
            <span>support@resolvex.edu</span>
            <span>+91 141-000-0000</span>
            <span>Student Services Building, Room 12</span>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-800 py-5 text-center text-xs text-ink-500">
        &copy; {new Date().getFullYear()} ResolveX. Built for a better campus.
      </div>
    </footer>
  );
}
