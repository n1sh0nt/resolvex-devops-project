import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  BarChart3,
  BellRing,
  Image as ImageIcon,
  Search,
  Wrench,
  Wifi,
  Droplets,
  Home,
  BookOpen,
  Trophy,
  Lock,
  Sparkles,
  Package,
} from 'lucide-react';

const categories = [
  { label: 'Electrical', icon: Zap },
  { label: 'Plumbing', icon: Wrench },
  { label: 'Internet', icon: Wifi },
  { label: 'Water Supply', icon: Droplets },
  { label: 'Hostel', icon: Home },
  { label: 'Library', icon: BookOpen },
  { label: 'Sports', icon: Trophy },
  { label: 'Others', icon: Package },
];

const features = [
  { title: 'Track every ticket', desc: 'A running timeline shows exactly when your complaint moved from pending to resolved.', icon: BarChart3 },
  { title: 'Photo evidence', desc: 'Attach images to complaints and resolutions so nothing gets lost in translation.', icon: ImageIcon },
  { title: 'Instant notifications', desc: 'Email and in-app alerts the moment your complaint is assigned or updated.', icon: BellRing },
  { title: 'Role-based access', desc: 'Students, faculty, staff, and admins each see exactly what they need — nothing more.', icon: ShieldCheck },
  { title: 'Searchable history', desc: 'Filter and search past complaints by category, status, or date in seconds.', icon: Search },
  { title: 'Secure by design', desc: 'JWT authentication, encrypted passwords, and audit logs on every action.', icon: Lock },
];

const steps = [
  { step: 'Log the issue', detail: 'Fill out a short form with category, location, and photos.' },
  { step: 'It gets routed', detail: 'Your complaint is auto-assigned to the right department.' },
  { step: 'Work happens', detail: 'Staff update status as they diagnose and fix the issue.' },
  { step: 'You confirm', detail: 'Rate the resolution so the record stays accurate.' },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,155,60,0.12),_transparent_55%)]" />
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brass-200 bg-brass-50 px-3 py-1 text-xs font-semibold text-brass-600">
              <Sparkles size={13} /> Built for college campuses
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] text-ink-900 sm:text-5xl">
              Every campus complaint,
              <br /> logged, routed, <span className="text-brass-500">resolved.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-500">
              ResolveX replaces scattered emails and lost paper forms with one clear system —
              students report issues, departments act on them, and admins see the whole campus at a glance.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-accent">
                Get started <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-outline">
                I already have an account
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-8 text-sm text-ink-400">
              <div>
                <p className="font-display text-2xl font-bold text-ink-900">6</p>
                <p>Status stages tracked</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink-900">12</p>
                <p>Complaint categories</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink-900">24/7</p>
                <p>Submission access</p>
              </div>
            </div>
          </div>

          {/* Signature element: ticket stub card */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="card relative rotate-1 border-ink-100 p-0 shadow-2xl">
              <div className="flex items-center justify-between border-b border-dashed border-ink-200 px-5 py-4">
                <span className="font-mono text-xs font-semibold text-brass-500">RX-2026-00842</span>
                <span className="badge bg-emerald-50 text-status-resolved border border-emerald-200">Resolved</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Complaint</p>
                <p className="mt-1 text-sm font-semibold text-ink-900">Flickering lights in Room 204</p>
                <p className="mt-1 text-xs text-ink-500">Academic Block A · Electrical</p>

                <div className="mt-5 space-y-3">
                  {['Submitted', 'Assigned', 'In Progress', 'Resolved'].map((s, i) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-800 text-[10px] font-bold text-brass-300">
                        {i + 1}
                      </span>
                      <span className="text-xs text-ink-600">{s}</span>
                      <span className="ml-auto h-1.5 flex-1 max-w-16 rounded-full bg-ink-100">
                        <span className="block h-full rounded-full bg-brass-400" style={{ width: '100%' }} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-dashed border-ink-200 px-5 py-3 text-center text-[11px] text-ink-400">
                Rated 5/5 by student · resolved in 2 days
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 -z-10 h-full w-full rounded-xl2 border-2 border-brass-200" />
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="border-y border-ink-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
            Route complaints to the right department, automatically
          </p>
          <div className="mt-6 grid grid-cols-4 gap-4 sm:grid-cols-8">
            {categories.map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-600">
                  <c.icon size={18} />
                </span>
                <span className="text-[11px] font-medium text-ink-500">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold">Everything a campus support office needs</h2>
          <p className="mt-3 text-ink-500">
            One system for the whole complaint lifecycle — from the first report to the closing rating.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800 text-brass-300">
                <f.icon size={18} />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold">From report to resolution in four steps</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="rounded-xl2 border border-ink-800 bg-ink-800/40 p-5">
                <span className="font-display text-3xl font-bold text-brass-400">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-sm font-semibold">{s.step}</h3>
                <p className="mt-1.5 text-sm text-ink-300">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to clear the backlog?</h2>
        <p className="mt-3 text-ink-500">Create your account and submit your first complaint in under a minute.</p>
        <div className="mt-7 flex justify-center gap-3">
          <Link to="/register" className="btn-accent">
            Create free account <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-outline">
            Talk to support
          </Link>
        </div>
      </section>
    </div>
  );
}
