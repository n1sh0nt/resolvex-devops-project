import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-ghost h-9 w-9 p-0 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {pageNumbers.map((n, idx) => (
        <div key={n} className="flex items-center gap-1.5">
          {idx > 0 && pageNumbers[idx - 1] !== n - 1 && <span className="text-ink-300 px-1">…</span>}
          <button
            onClick={() => onChange(n)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
              n === page ? 'bg-ink-800 text-white' : 'text-ink-600 hover:bg-ink-50'
            }`}
          >
            {n}
          </button>
        </div>
      ))}

      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="btn-ghost h-9 w-9 p-0 disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
