import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { KeyRound } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { ROLE_DASHBOARD_PATH } from '../utils/constants';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      const { data } = await authApi.resetPassword(token, password);
      localStorage.setItem('resolvex_token', data.token);
      localStorage.setItem('resolvex_user', JSON.stringify(data.user));
      toast.success('Password reset successfully. Welcome back!');
      navigate(ROLE_DASHBOARD_PATH[data.user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'This reset link is invalid or has expired.');
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
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Set a new password</h1>
          <p className="mt-1.5 text-sm text-ink-500">Choose a strong password you haven't used before.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="At least 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Must be at least 8 characters' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-400"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              placeholder="Re-enter your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value, formValues) => value === formValues.password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <KeyRound size={16} /> {isSubmitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
