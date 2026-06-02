import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import CategoryTabs from '../../components/student/CategoryTabs';
import FileCard from '../../components/student/FileCard';
import { fetchFiles } from '../../services/fileService';
import { Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, activeCategory, searchQuery]);

  const loadFiles = async () => {
    try {
      const data = await fetchFiles();
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const filterFiles = () => {
    let result = files;

    if (activeCategory !== 'all') {
      result = result.filter(f => f.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.title.toLowerCase().includes(q) || 
        (f.subject && f.subject.toLowerCase().includes(q))
      );
    }

    setFilteredFiles(result);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex-grow">
            <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
            <input
              type="text"
              placeholder="Search by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-primary/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-64 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredFiles.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {filteredFiles.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-textSecondary space-y-4">
                <Info size={48} className="opacity-20" />
                <p className="text-xl font-inter">No resources found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-8 border-t border-primary/10 text-center text-textSecondary font-inter mt-auto">
        <p>© 2026 CSMU Cloud Notes | Chhatrapati Shivaji Maharaj University</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
