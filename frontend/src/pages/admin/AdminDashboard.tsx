import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/layout/Navbar';
import { motion } from 'framer-motion';
import { Clock, Database, FileText, Files, HardDrive, BarChart3, TrendingUp, RefreshCw } from 'lucide-react';
import { fetchAdminStats } from '../../services/apiService';
import { supabase } from '../../config/supabase';
import { toast } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadStats();

    // Subscribe to real-time changes on the files table
    const channel = supabase
      .channel('admin-stats-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'files' },
        () => {
          // Auto-refresh stats on any file change
          loadStats();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-poppins text-textPrimary">Analytics Overview</h1>
            <p className="text-textSecondary font-inter text-sm">Real-time usage statistics for CSMU Cloud Notes.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-8 h-40 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold font-poppins text-textSecondary uppercase tracking-wider">Total Resources</p>
                <h2 className="text-4xl font-bold font-poppins text-textPrimary mt-2">{stats?.totalFiles || 0}</h2>
              </div>
              <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                <Files size={32} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold font-poppins text-textSecondary uppercase tracking-wider">Storage Used</p>
                <h2 className="text-4xl font-bold font-poppins text-textPrimary mt-2">{formatSize(stats?.totalSize)}</h2>
              </div>
              <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
                <HardDrive size={32} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold font-poppins text-textSecondary uppercase tracking-wider">System Status</p>
                <h2 className="text-2xl font-bold font-poppins text-green-500 mt-2 flex items-center gap-2">
                  <TrendingUp size={24} />
                  Operational
                </h2>
              </div>
              <div className="p-4 bg-green-50 text-green-500 rounded-2xl">
                <Database size={32} />
              </div>
            </motion.div>
          </div>
        )}

        <h3 className="text-xl font-bold font-poppins text-textPrimary mb-6 px-1">Category Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {stats?.categoryStats && Object.entries(stats.categoryStats).map(([cat, count], i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 + 0.3 }}
              className="glass-card p-6 text-center space-y-2 border-b-4 border-b-primary"
            >
              <p className="text-[10px] font-bold font-montserrat uppercase text-textSecondary">{cat.replace('-', ' ')}</p>
              <p className="text-2xl font-bold font-poppins text-textPrimary">{count as number}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6 px-1">
          <Clock size={22} className="text-primary" />
          <h3 className="text-xl font-bold font-poppins text-textPrimary">Recent Uploads</h3>
        </div>

        <div className="glass-card overflow-hidden">
          {stats?.recentUploads?.length ? (
            <div className="divide-y divide-primary/5">
              {stats.recentUploads.map((file: any, index: number) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-primary/10 p-3 text-primary">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-poppins font-semibold text-textPrimary">
                        {file.title}
                      </p>
                      <p className="text-sm text-textSecondary font-inter">
                        {file.subject || 'General'} • {file.uploader_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm text-textSecondary sm:justify-end">
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold uppercase text-secondary">
                      {file.category.replace('-', ' ')}
                    </span>
                    <span>{formatSize(file.file_size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-12 text-center text-textSecondary font-inter">
              No recent uploads yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
