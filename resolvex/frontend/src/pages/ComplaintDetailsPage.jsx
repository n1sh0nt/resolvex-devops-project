import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Clock, Trash2, Star, UploadCloud, UserCog2 } from 'lucide-react';
import { format } from 'date-fns';
import { complaintApi, departmentApi, userApi, feedbackApi } from '../api/endpoints';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import ComplaintTimeline from '../components/complaints/ComplaintTimeline';
import Spinner from '../components/common/Spinner';
import { STATUSES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await complaintApi.get(id);
      setComplaint(data.complaint);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load this complaint.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.role === 'admin') {
      departmentApi.list().then(({ data }) => setDepartments(data.departments));
    }
  }, [user]);

  useEffect(() => {
    const deptId = complaint?.department?._id;
    if (user?.role === 'admin' && deptId) {
      userApi.departmentStaff(deptId).then(({ data }) => setStaffList(data.staff));
    }
  }, [user, complaint?.department?._id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!complaint) return null;

  const canDelete =
    user.role === 'admin' || (String(complaint.submittedBy._id) === String(user._id) && complaint.status === 'Pending');

  const handleDelete = async () => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try {
      await complaintApi.remove(id);
      toast.success('Complaint deleted.');
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-semibold text-brass-500">{complaint.ticketId}</span>
          <h1 className="mt-1 text-2xl font-bold text-ink-900">{complaint.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="text-xs text-ink-400">{complaint.category}</span>
          </div>
        </div>
        {canDelete && (
          <button onClick={handleDelete} className="btn-outline text-status-rejected">
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{complaint.description}</p>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-400">
              {complaint.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {complaint.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={13} /> Submitted {format(new Date(complaint.createdAt), 'MMM d, yyyy · h:mm a')}
              </span>
            </div>

            {complaint.images?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Attached photos</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {complaint.images.map((img, idx) => (
                    <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-lg border border-ink-100">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {complaint.resolutionRemarks && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-status-resolved">Resolution notes</p>
                <p className="mt-1 text-sm text-ink-700">{complaint.resolutionRemarks}</p>
              </div>
            )}

            {complaint.resolutionImages?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Resolution photos</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {complaint.resolutionImages.map((img, idx) => (
                    <a key={idx} href={img.url} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-lg border border-ink-100">
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink-900">Timeline</h2>
            <ComplaintTimeline timeline={complaint.timeline} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-900">Details</h2>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">Submitted by</dt>
                <dd className="font-medium text-ink-700">{complaint.submittedBy?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Department</dt>
                <dd className="font-medium text-ink-700">{complaint.department?.name || 'Unassigned'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-400">Assigned to</dt>
                <dd className="font-medium text-ink-700">{complaint.assignedTo?.name || 'Unassigned'}</dd>
              </div>
            </dl>
          </div>

          {user.role === 'admin' && (
            <AssignPanel
              complaint={complaint}
              departments={departments}
              staffList={staffList}
              onDepartmentChange={(deptId) => userApi.departmentStaff(deptId).then(({ data }) => setStaffList(data.staff))}
              onAssigned={load}
            />
          )}

          {['staff', 'admin'].includes(user.role) && complaint.status !== 'Closed' && (
            <StatusUpdatePanel complaintId={complaint._id} onUpdated={load} />
          )}

          {['student', 'faculty'].includes(user.role) &&
            ['Resolved', 'Closed'].includes(complaint.status) &&
            !complaint.isFeedbackGiven &&
            String(complaint.submittedBy._id) === String(user._id) && (
              <FeedbackPanel complaintId={complaint._id} onSubmitted={load} />
            )}
        </div>
      </div>
    </div>
  );
}

function AssignPanel({ complaint, departments, staffList, onDepartmentChange, onAssigned }) {
  const [department, setDepartment] = useState(complaint.department?._id || '');
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo?._id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await complaintApi.assign(complaint._id, { department: department || undefined, assignedTo: assignedTo || undefined });
      toast.success('Complaint assigned successfully.');
      onAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <UserCog2 size={15} /> Assign complaint
      </h2>
      <div>
        <label className="label">Department</label>
        <select
          className="input"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setAssignedTo('');
            if (e.target.value) onDepartmentChange(e.target.value);
          }}
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Staff member</label>
        <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} disabled={!department}>
          <option value="">Select staff (optional)</option>
          {staffList.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Assigning…' : 'Assign'}
      </button>
    </form>
  );
}

function StatusUpdatePanel({ complaintId, onUpdated }) {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      toast.error('Please select a new status.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      if (note) formData.append('note', note);
      files.forEach((f) => formData.append('images', f));
      await complaintApi.updateStatus(complaintId, formData);
      toast.success('Status updated.');
      setStatus('');
      setNote('');
      setFiles([]);
      onUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-5">
      <h2 className="text-sm font-semibold text-ink-900">Update status</h2>
      <div>
        <label className="label">New status</label>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Remarks (optional)</label>
        <textarea rows={3} className="input resize-none" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done to resolve this?" />
      </div>
      <div>
        <label className="label">Resolution photos (optional)</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 px-3 py-4 text-xs text-ink-500 hover:border-brass-300">
          <UploadCloud size={16} /> Upload up to 5 images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
          />
        </label>
        {files.length > 0 && <p className="mt-1 text-xs text-ink-400">{files.length} file(s) selected</p>}
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Updating…' : 'Update status'}
      </button>
    </form>
  );
}

function FeedbackPanel({ complaintId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.submit({ complaint: complaintId, rating, comment });
      toast.success('Thanks for your feedback!');
      onSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-3 p-5">
      <h2 className="text-sm font-semibold text-ink-900">Rate this resolution</h2>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
            <Star size={22} className={n <= rating ? 'fill-brass-400 text-brass-400' : 'text-ink-200'} />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        className="input resize-none"
        placeholder="Optional comment about how it was handled"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit" disabled={submitting} className="btn-accent w-full">
        {submitting ? 'Submitting…' : 'Submit feedback'}
      </button>
    </form>
  );
}
