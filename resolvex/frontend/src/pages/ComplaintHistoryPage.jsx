import { useEffect, useState } from 'react';
import { Search, ListFilter, FileText } from 'lucide-react';
import { complaintApi } from '../api/endpoints';
import ComplaintCard from '../components/complaints/ComplaintCard';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { CATEGORIES, STATUSES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function ComplaintHistoryPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', category: '', page: 1 });

  const fetchComplaints = async (params) => {
    setLoading(true);
    try {
      const query = { ...params, limit: 10 };
      Object.keys(query).forEach((k) => query[k] === '' && delete query[k]);
      const { data } = await complaintApi.list(query);
      setComplaints(data.complaints);
      setMeta({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      /* handled globally via toast on network errors elsewhere if needed */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const pageTitle =
    user?.role === 'admin' ? 'All Complaints' : user?.role === 'staff' ? 'Assigned Complaints' : 'Complaint History';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-ink-500">{meta.total} complaint{meta.total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="card mt-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            className="input pl-9"
            placeholder="Search by title, description, or ticket ID…"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <ListFilter size={16} className="hidden text-ink-400 sm:block" />
          <select
            className="input w-auto min-w-[9rem]"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="input w-auto min-w-[9rem]"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : complaints.length ? (
          complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)
        ) : (
          <EmptyState icon={FileText} title="No complaints found" message="Try adjusting your search or filters." />
        )}
      </div>

      <Pagination page={meta.page} pages={meta.pages} onChange={(page) => setFilters((f) => ({ ...f, page }))} />
    </div>
  );
}
