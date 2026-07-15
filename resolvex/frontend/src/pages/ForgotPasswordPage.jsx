import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/endpoints';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-800 font-display text-lg font-bold text-brass-300">
              R
            </span>
            <span className="font-display text-xl font-bold text-ink-900">ResolveX</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Reset your password</h1>
          <p className="mt-1.5 text-sm text-ink-500">We'll email you a link to set a new one.</p>
        </div>

        {sent ? (
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brass-50 text-brass-500">
              <Mail size={22} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-ink-900">Check your inbox</h2>
            <p className="mt-1.5 text-sm text-ink-500">
              If an account exists with that email, a password reset link is on its way. The link expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@resolvex.edu"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
}
