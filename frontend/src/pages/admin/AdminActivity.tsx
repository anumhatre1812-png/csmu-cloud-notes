import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import { motion } from 'framer-motion';
import { fetchActivityLogsApi } from '../../services/apiService';
import { Clock, Upload, Edit3, Trash2, ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const actionIcons: Record<string, React.ReactNode> = {
  upload: <Upload size={14} className="text-green-500" />,
  edit: <Edit3 size={14} className="text-blue-500" />,
  delete: <Trash2 size={14} className="text-red-500" />,
};

const actionLabels: Record<string, string> = {
  upload: 'Uploaded',
  edit: 'Edited',
  delete: 'Deleted',
};

const AdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const loadActivity = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetchActivityLogsApi(p, 30);
      setActivities(res.activities);
      setTotalPages(res.pagination.totalPages);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity(page);
  }, [page, loadActivity]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filtered = searchQuery
    ? activities.filter(a =>
        (a.admin_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.file_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.action || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activities;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Clock size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-poppins text-textPrimary">Activity Log</h1>
              <p className="text-textSecondary font-inter text-sm">Admin action audit trail</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter text-sm"
              />
            </div>
            <button
              onClick={() => loadActivity(page)}
              className="p-2.5 bg-white/50 border border-primary/10 rounded-xl text-textSecondary hover:text-primary transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="divide-y divide-primary/5">
              {filtered.map((activity: any) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-primary/[0.02] transition-colors"
                >
                  <div className="p-2 bg-white rounded-xl border border-primary/5 shrink-0">
                    {actionIcons[activity.action] || <Clock size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-inter text-textPrimary">
                      <span className="font-semibold">{activity.admin_email?.split('@')[0]}</span>
                      {' '}{actionLabels[activity.action] || activity.action}{' '}
                      {activity.file_title ? (
                        <span className="font-medium">"{activity.file_title}"</span>
                      ) : activity.action === 'delete' ? (
                        <span className="italic text-textSecondary">a file</span>
                      ) : null}
                    </p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <p className="text-xs text-textSecondary font-inter mt-0.5 truncate">
                        {JSON.stringify(activity.metadata)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-textSecondary font-inter shrink-0">{formatDate(activity.created_at)}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-textSecondary">
              <Clock size={40} className="opacity-20" />
              <p className="mt-4 text-lg font-inter">No activity logs found.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-white/50 border border-primary/10 text-textSecondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-inter text-textSecondary">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white/50 border border-primary/10 text-textSecondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminActivity;
