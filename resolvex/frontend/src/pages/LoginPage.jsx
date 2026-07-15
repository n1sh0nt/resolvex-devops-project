import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_DASHBOARD_PATH } from '../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const redirectTo = location.state?.from?.pathname || ROLE_DASHBOARD_PATH[user.role] || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-500">Log in to track and manage complaints.</p>
        </div>

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

          <div>
            <div className="flex items-center justify-between">
              <label className="label">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-brass-500 hover:text-brass-600">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <LogIn size={16} /> {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brass-500 hover:text-brass-600">
            Register
          </Link>
        </p>

        <div className="mt-6 rounded-xl2 border border-dashed border-ink-200 bg-white/60 p-4 text-xs text-ink-500">
          <p className="font-semibold text-ink-700">Demo accounts</p>
          <p className="mt-1">Student: student@resolvex.edu / Student@1234</p>
          <p>Staff: staff.electrical@resolvex.edu / Staff@1234</p>
          <p>Admin: admin@resolvex.edu / Admin@1234</p>
        </div>
      </div>
    </div>
  );
}
