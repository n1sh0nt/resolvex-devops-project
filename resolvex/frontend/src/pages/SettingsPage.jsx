import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Moon, Sun, KeyRound, Megaphone } from 'lucide-react';
import { authApi, notificationApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const { dark, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your account preferences.</p>
      </div>

      <div className="card flex items-center justify-between p-6">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Appearance</h2>
          <p className="mt-1 text-sm text-ink-500">Switch between light and dark mode.</p>
        </div>
        <button onClick={toggleTheme} className="btn-outline">
          {dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <PasswordSection />

      {user?.role === 'admin' && <BroadcastSection />}
    </div>
  );
}

function PasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await authApi.updatePassword(values);
      toast.success('Password updated successfully.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <KeyRound size={15} /> Change password
      </h2>
      <div>
        <label className="label">Current password</label>
        <input type="password" className="input" {...register('currentPassword', { required: 'Required' })} />
        {errors.currentPassword && <p className="field-error">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="label">New password</label>
        <input
          type="password"
          className="input"
          {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })}
        />
        {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

function BroadcastSection() {
  const [form, setForm] = useState({ title: '', message: '', role: 'all' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error('Title and message are required.');
      return;
    }
    setSending(true);
    try {
      const { data } = await notificationApi.broadcast(form);
      toast.success(data.message);
      setForm({ title: '', message: '', role: 'all' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Megaphone size={15} /> Send broadcast notification
      </h2>
      <div>
        <label className="label">Audience</label>
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="all">Everyone</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="staff">Department staff</option>
        </select>
      </div>
      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="label">Message</label>
        <textarea rows={3} className="input resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      <button type="submit" disabled={sending} className="btn-accent">
        {sending ? 'Sending…' : 'Send to campus'}
      </button>
    </form>
  );
}
