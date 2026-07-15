export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-ink-50 p-3.5 text-ink-400">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
