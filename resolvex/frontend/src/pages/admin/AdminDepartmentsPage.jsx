import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { departmentApi } from '../../api/endpoints';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { CATEGORIES } from '../../utils/constants';

const emptyForm = { name: '', description: '', categories: [] };

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await departmentApi.list();
      setDepartments(data.departments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name, description: d.description || '', categories: d.categories || [] });
    setModalOpen(true);
  };

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await departmentApi.update(editing._id, form);
        toast.success('Department updated.');
      } else {
        await departmentApi.create(form);
        toast.success('Department created.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete "${d.name}"? Departments with linked complaints will be deactivated instead.`)) return;
    try {
      const { data } = await departmentApi.remove(d._id);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Departments</h1>
          <p className="mt-1 text-sm text-ink-500">Manage the departments that handle campus complaints.</p>
        </div>
        <button onClick={openCreate} className="btn-accent">
          <Plus size={16} /> Add department
        </button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" message="Create your first department to start routing complaints." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d._id} className="card p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-ink-900">{d.name}</h3>
                {!d.isActive && <span className="badge bg-slate-100 text-status-closed">Inactive</span>}
              </div>
              <p className="mt-1.5 text-sm text-ink-500">{d.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.categories?.map((c) => (
                  <span key={c} className="badge bg-ink-50 text-ink-500">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2 border-t border-ink-100 pt-3">
                <button onClick={() => openEdit(d)} className="btn-ghost flex-1 justify-center">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(d)} className="btn-ghost flex-1 justify-center text-status-rejected">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit department' : 'Add department'}
        footer={
          <>
            <button className="btn-outline" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Categories handled</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.categories.includes(c) ? 'border-brass-400 bg-brass-50 text-ink-900' : 'border-ink-200 text-ink-500'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
