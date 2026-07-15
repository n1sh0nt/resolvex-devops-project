import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    // No dedicated contact endpoint - this opens the user's email client with the message pre-filled.
    const subject = encodeURIComponent(`ResolveX contact form: ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:support@resolvex.edu?subject=${subject}&body=${body}`;
    toast.success('Opening your email client to send the message.');
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <span className="text-xs font-semibold uppercase tracking-widest text-brass-500">Contact</span>
      <h1 className="mt-3 text-4xl font-bold">Talk to the support office</h1>
      <p className="mt-4 max-w-xl text-ink-500">
        For urgent facility issues, submit a complaint directly through your dashboard for the
        fastest response. Use this form for general questions about the platform.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card flex items-start gap-3 p-4">
            <Mail size={18} className="mt-0.5 text-brass-500" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Email</p>
              <p className="text-sm text-ink-500">support@resolvex.edu</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-4">
            <Phone size={18} className="mt-0.5 text-brass-500" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Phone</p>
              <p className="text-sm text-ink-500">+91 141-000-0000</p>
            </div>
          </div>
          <div className="card flex items-start gap-3 p-4">
            <MapPin size={18} className="mt-0.5 text-brass-500" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Office</p>
              <p className="text-sm text-ink-500">Student Services Building, Room 12</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6 lg:col-span-3">
          <div>
            <label className="label">Your name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="Jordan Lee" />
          </div>
          <div>
            <label className="label">Email address</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input"
              placeholder="you@resolvex.edu"
            />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="input resize-none"
              placeholder="How can we help?"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-accent w-full sm:w-auto">
            <Send size={16} /> Send message
          </button>
        </form>
      </div>
    </div>
  );
}
