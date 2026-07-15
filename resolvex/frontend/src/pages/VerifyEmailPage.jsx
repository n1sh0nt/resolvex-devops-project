import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../api/endpoints';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto animate-spin text-brass-400" size={36} />
            <h1 className="mt-4 text-lg font-semibold text-ink-900">Verifying your email…</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto text-status-resolved" size={36} />
            <h1 className="mt-4 text-lg font-semibold text-ink-900">Email verified</h1>
            <p className="mt-1.5 text-sm text-ink-500">{message}</p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              Continue to login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-status-rejected" size={36} />
            <h1 className="mt-4 text-lg font-semibold text-ink-900">Verification failed</h1>
            <p className="mt-1.5 text-sm text-ink-500">{message}</p>
            <Link to="/login" className="btn-outline mt-6 inline-flex">
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
