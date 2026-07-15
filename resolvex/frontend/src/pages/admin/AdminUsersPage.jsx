import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { UserPlus, Search, ShieldOff, Pencil } from 'lucide-react';
import { userApi, departmentApi } from '../../api/endpoints';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ROLE_LABELS } from '../../utils/constants';

const emptyForm = { name: '', email: '', password: '', role: 'student', department: '', phone: '' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const { data } = await userApi.list(params);
      setUsers(data.users);
      setMeta({ page: data.page, pages: data.pages, total: data.total });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentApi.list().then(({ data }) => setDepartments(data.departments));
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department?._id || '', phone: u.phone || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await userApi.update(editingUser._id, {
          name: form.name,
          role: form.role,
          department: form.department || null,
          phone: form.phone,
        });
        toast.success('User updated.');
      } else {
        await userApi.create(form);
        toast.success('User created.');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (!window.confirm(`Deactivate ${u.name}? They will no longer be able to log in.`)) return;
    try {
      await userApi.remove(u._id);
      toast.success('User deactivated.');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user.');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Manage users</h1>
          <p className="mt-1 text-sm text-ink-500">{meta.total} user{meta.total !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openCreate} className="btn-accent">
          <UserPlus size={16} /> Add user
        </button>
      </div>

      <div className="card mt-5 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            className="input pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="card mt-5 overflow-x-auto">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" message="Try a different search term." />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-800">{u.name}</td>
                  <td className="px-4 py-3 text-ink-500">{u.email}</td>
                  <td className="px-4 py-3 text-ink-500">{ROLE_LABELS[u.role]}</td>
                  <td className="px-4 py-3 text-ink-500">{u.department?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'bg-emerald-50 text-status-resolved' : 'bg-slate-100 text-status-closed'}`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700">
                        <Pencil size={15} />
                      </button>
                      {u.isActive && (
                        <button onClick={() => handleDeactivate(u)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-status-rejected">
                          <ShieldOff size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Edit user' : 'Add user'}
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
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              disabled={!!editingUser}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          {!editingUser && (
            <div>
              <label className="label">Temporary password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
              />
            </div>
          )}
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Department (for staff)</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
