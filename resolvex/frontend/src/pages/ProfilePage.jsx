import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/endpoints';
import { ROLE_LABELS } from '../utils/constants';

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      studentId: user?.studentId,
      employeeId: user?.employeeId,
    },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await userApi.updateProfile(values);
      updateLocalUser(data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userApi.updateAvatar(formData);
      updateLocalUser(data.user);
      toast.success('Avatar updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-ink-900">Your profile</h1>
      <p className="mt-1 text-sm text-ink-500">Update your personal information.</p>

      <div className="card mt-6 flex items-center gap-4 p-6">
        <div className="relative">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 text-xl font-semibold text-ink-600">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-ink-800 text-white">
            <Camera size={12} />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="text-base font-semibold text-ink-900">{user?.name}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
          <span className="badge mt-1 bg-ink-50 text-ink-600">{ROLE_LABELS[user?.role]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-5 space-y-4 p-6">
        <div>
          <label className="label">Full name</label>
          <input className="input" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="label">Email (cannot be changed)</label>
          <input className="input bg-ink-50" value={user?.email} disabled />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" {...register('phone')} />
        </div>
        {user?.role === 'student' && (
          <div>
            <label className="label">Student ID</label>
            <input className="input" {...register('studentId')} />
          </div>
        )}
        {['faculty', 'staff', 'admin'].includes(user?.role) && (
          <div>
            <label className="label">Employee ID</label>
            <input className="input" {...register('employeeId')} />
          </div>
        )}
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          <Save size={15} /> {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
