import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UploadCloud, X, Send } from 'lucide-react';
import { complaintApi } from '../api/endpoints';
import { CATEGORIES, PRIORITIES } from '../utils/constants';

const MAX_IMAGES = 5;

export default function SubmitComplaintPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { priority: 'Medium' } });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const combined = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(combined);
    e.target.value = '';
  };

  const removeImage = (idx) => setImages((imgs) => imgs.filter((_, i) => i !== idx));

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      images.forEach((img) => formData.append('images', img));

      const { data } = await complaintApi.create(formData);
      toast.success(`Complaint ${data.complaint.ticketId} submitted successfully.`);
      navigate(`/complaints/${data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-ink-900">Submit a complaint</h1>
      <p className="mt-1 text-sm text-ink-500">
        Give as much detail as you can — clear complaints get resolved faster.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            placeholder="e.g. Flickering lights in Room 204"
            {...register('title', { required: 'Title is required', maxLength: 150 })}
          />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category', { required: 'Category is required' })}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category.message}</p>}
          </div>

          <div>
            <label className="label">Priority</label>
            <select className="input" {...register('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Location (optional)</label>
          <input className="input" placeholder="e.g. Academic Block A, Room 204" {...register('location')} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={5}
            className="input resize-none"
            placeholder="Describe what's wrong, when it started, and anything else that would help resolve it."
            {...register('description', { required: 'Description is required', maxLength: 3000 })}
          />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Photos (optional, up to {MAX_IMAGES})</label>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl2 border-2 border-dashed border-ink-200 bg-white/50 px-4 py-8 text-center hover:border-brass-300">
            <UploadCloud size={22} className="text-ink-400" />
            <span className="text-sm text-ink-500">Click to upload JPEG, PNG, or WEBP images (max 5MB each)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={images.length >= MAX_IMAGES}
            />
          </label>

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-ink-100">
                  <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 rounded-full bg-ink-900/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-accent w-full">
          <Send size={16} /> {isSubmitting ? 'Submitting…' : 'Submit complaint'}
        </button>
      </form>
    </div>
  );
}
