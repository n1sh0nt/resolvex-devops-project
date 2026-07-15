import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-5 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-400">
        <Compass size={28} />
      </span>
      <h1 className="mt-6 font-display text-6xl font-bold text-ink-900">404</h1>
      <p className="mt-2 text-lg font-semibold text-ink-800">This page took a wrong turn.</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
