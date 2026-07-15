export default function StatCard({ label, value, icon: Icon, accent = 'ink', hint }) {
  const accents = {
    ink: 'bg-ink-800 text-white',
    brass: 'bg-brass-400 text-ink-900',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
    blue: 'bg-blue-500 text-white',
    red: 'bg-red-500 text-white',
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <p className="mt-1.5 text-3xl font-display font-bold text-ink-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
      </div>
      {Icon && (
        <div className={`rounded-xl p-2.5 ${accents[accent]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
