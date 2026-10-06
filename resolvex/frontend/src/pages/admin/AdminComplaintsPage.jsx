import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { complaintApi } from '../../api/endpoints';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const STATUS_OPTIONS = [
  'Pending',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Rejected',
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadComplaints = useCallback(async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit: 10,
        sort: '-createdAt',
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (priority) {
        params.priority = priority;
      }

      const { data } = await complaintApi.list(params);

      setComplaints(data.complaints || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to load complaints.'
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handlePriorityChange = (e) => {
    setPriority(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            Complaint Management
          </h1>

          <p className="mt-1 text-sm text-ink-500">
            Track, assign and manage all complaints.
          </p>
        </div>

        <button
          onClick={loadComplaints}
          className="btn-outline"
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Search & filters */}
      <div className="card mt-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search ticket ID, title or description..."
              className="input pl-10"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={handleStatusChange}
            className="input lg:w-48"
          >
            <option value="">All statuses</option>

            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={handlePriorityChange}
            className="input lg:w-40"
          >
            <option value="">All priorities</option>

            {PRIORITY_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="btn-outline"
            type="button"
          >
            <Filter size={15} />
            Clear
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-ink-500">
        Showing <span className="font-semibold text-ink-800">
          {complaints.length}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-ink-800">
          {total}
        </span>{' '}
        complaints
      </div>

      {/* Table */}
      <div className="card mt-3 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-ink-700">
              No complaints found.
            </p>

            <p className="mt-1 text-xs text-ink-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b border-ink-100 bg-ink-50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Ticket
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Complaint
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Submitted By
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Priority
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Assigned To
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-ink-100">
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint._id}
                      className="transition hover:bg-ink-50/70"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-brass-600">
                          {complaint.ticketId}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4">
                        <p className="truncate text-sm font-semibold text-ink-800">
                          {complaint.title}
                        </p>

                        <p className="mt-1 text-xs text-ink-400">
                          {complaint.category}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-sm text-ink-700">
                          {complaint.submittedBy?.name || 'Unknown'}
                        </p>

                        <p className="text-xs text-ink-400">
                          {complaint.submittedBy?.email || ''}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <PriorityBadge priority={complaint.priority} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <StatusBadge status={complaint.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-ink-600">
                        {complaint.assignedTo?.name || 'Unassigned'}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Link
                          to={`/complaints/${complaint._id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                        >
                          <Eye size={14} />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-ink-100 md:hidden">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-semibold text-brass-600">
                        {complaint.ticketId}
                      </span>

                      <h3 className="mt-1 text-sm font-semibold text-ink-800">
                        {complaint.title}
                      </h3>
                    </div>

                    <StatusBadge status={complaint.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <PriorityBadge priority={complaint.priority} />

                    <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs text-ink-500">
                      {complaint.category}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-ink-500">
                    Submitted by:{' '}
                    <span className="font-medium text-ink-700">
                      {complaint.submittedBy?.name || 'Unknown'}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-ink-500">
                    Assigned to:{' '}
                    <span className="font-medium text-ink-700">
                      {complaint.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>

                  <Link
                    to={`/complaints/${complaint._id}`}
                    className="btn-outline mt-4 w-full justify-center"
                  >
                    <Eye size={15} />
                    View Complaint
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-ink-500">
            Page{' '}
            <span className="font-semibold text-ink-800">
              {page}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-ink-800">
              {pages}
            </span>
          </span>

          <button
            onClick={() =>
              setPage((current) => Math.min(pages, current + 1))
            }
            disabled={page >= pages}
            className="btn-outline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
