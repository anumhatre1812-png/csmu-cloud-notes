import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { motion } from 'framer-motion';
import { Database, Files, HardDrive, BarChart3, TrendingUp } from 'lucide-react';
import { fetchAdminStats } from '../../services/apiService';
import { toast } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-10">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats && Object.entries(stats.categoryStats).map(([cat, count], i) => (
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
      </main>
    </div>
  );
};

export default AdminDashboard;
