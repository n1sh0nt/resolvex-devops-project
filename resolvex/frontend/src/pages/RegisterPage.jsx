import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'student' } });

  const role = watch('role');

  const onSubmit = async (values) => {
    try {
      const { confirmPassword, ...payload } = values;
      const user = await registerUser(payload);
      toast.success(`Account created! A verification email has been sent to ${user.email}.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-ink-500">Students and faculty can self-register below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6">
          <div>
            <label className="label">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {['student', 'faculty'].map((r) => (
                <label
                  key={r}
                  className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm font-medium capitalize transition ${
                    role === r ? 'border-brass-400 bg-brass-50 text-ink-900' : 'border-ink-200 text-ink-500'
                  }`}
                >
                  <input type="radio" value={r} className="sr-only" {...register('role')} />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              placeholder="Jordan Lee"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>

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
            <label className="label">{role === 'student' ? 'Student ID' : 'Employee ID'} (optional)</label>
            <input
              className="input"
              placeholder={role === 'student' ? 'STU-3001' : 'FAC-2001'}
              {...register(role === 'student' ? 'studentId' : 'employeeId')}
            />
          </div>

          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" placeholder="9876543210" {...register('phone')} />
          </div>

          <div>
            <label className="label">Password</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirm password</label>
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
            <UserPlus size={16} /> {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brass-500 hover:text-brass-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
