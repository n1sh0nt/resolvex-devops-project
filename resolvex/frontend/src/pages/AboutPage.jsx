import { ShieldCheck, Target, Users2, Workflow } from 'lucide-react';

const values = [
  { title: 'Transparency', desc: 'Every status change is timestamped and visible to the person who filed the complaint.', icon: Workflow },
  { title: 'Accountability', desc: 'Assignments and audit logs make it clear who is responsible for what.', icon: ShieldCheck },
  { title: 'Accessibility', desc: 'Built mobile-first so anyone can report an issue from a hallway or hostel room.', icon: Users2 },
  { title: 'Continuous improvement', desc: 'Feedback ratings feed straight back to department performance.', icon: Target },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-widest text-brass-500">About ResolveX</span>
      <h1 className="mt-3 text-4xl font-bold">A single source of truth for campus complaints</h1>
      <p className="mt-5 text-base leading-relaxed text-ink-500">
        ResolveX was built for college campuses that were still tracking maintenance requests, IT
        issues, and facility complaints through scattered emails, phone calls, and paper forms. It
        gives every complaint a ticket number, a timeline, and an owner — so nothing falls through
        the cracks and everyone knows what's happening and why.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink-500">
        Students and faculty submit complaints in minutes. Department staff work from a focused
        queue instead of a crowded inbox. Administrators see the full picture through live
        analytics — which departments are fastest, which categories spike each month, and how
        satisfied people are with the resolutions they receive.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {values.map((v) => (
          <div key={v.title} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-brass-300">
              <v.icon size={18} />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-ink-900">{v.title}</h3>
            <p className="mt-1.5 text-sm text-ink-500">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 card p-6">
        <h2 className="text-lg font-semibold text-ink-900">How complaints move through the system</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-600">
          <li>A student or faculty member submits a complaint with a category, description, and optional photos.</li>
          <li>It's automatically routed to the department that handles that category, or assigned manually by an admin.</li>
          <li>Department staff update the status as they work — Assigned, In Progress, Resolved, or Closed.</li>
          <li>The complainant is notified by email and in-app alert at every step, and can leave feedback once it's resolved.</li>
        </ol>
      </div>
    </div>
  );
}
