import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/layout/Navbar';
import CategoryTabs from '../../components/student/CategoryTabs';
import FileCard from '../../components/student/FileCard';
import AnnouncementBanner from '../../components/student/AnnouncementBanner';
import { fetchFiles, fetchBookmarks, getRecentDownloads } from '../../services/fileService';
import { Search, Info, RefreshCw, WifiOff, ChevronLeft, ChevronRight, ArrowUpDown, Clock, Heart, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
const ITEMS_PER_PAGE = 12;

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'subject-asc';
type FilterTab = 'all' | 'bookmarked' | 'downloaded';

const SUBJECTS = [
  'Maths - III',
  'Digital logic Design (DLD)',
  'Data Structure with C++ (DS C++)',
  'Analog election circuit (AEC)',
  'Computer Organisation architecture (AOC)',
  'Microprocessor',
  'DataBase Management System (DBMS)',
  'Discreet Mathematics',
];

const StudentDashboard: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);

  useEffect(() => {
    loadFiles();
    loadBookmarks();
    loadRecentDownloads();
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, activeCategory, searchQuery, sortBy, filterTab, bookmarkedIds]);

  const loadFiles = async () => {
    try {
      setError(null);
      const data = await fetchFiles();
      setFiles(data);
    } catch (error: any) {
      const msg = error?.message || 'Failed to load files';
      setError(msg);
      if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarks = await fetchBookmarks();
      const ids = new Set(bookmarks.map((b: any) => b.file_id) as string[]);
      setBookmarkedIds(ids);
    } catch {
      // use localStorage fallback
      const local: string[] = JSON.parse(localStorage.getItem('csmu_local_bookmarks') || '[]');
      setBookmarkedIds(new Set(local));
    }
  };

  const loadRecentDownloads = () => {
    setRecentDownloads(getRecentDownloads());
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    try {
      const data = await fetchFiles();
      setFiles(data);
      loadBookmarks();
      loadRecentDownloads();
      toast.success('Notes updated');
    } catch {
      toast.error('Refresh failed');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const sortFiles = (list: any[], option: SortOption): any[] => {
    const sorted = [...list];
    switch (option) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'size-desc':
        return sorted.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
      case 'size-asc':
        return sorted.sort((a, b) => (a.file_size || 0) - (b.file_size || 0));
      case 'subject-asc':
        return sorted.sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
      default:
        return sorted;
    }
  };

  const filterFiles = () => {
    let result = files;

    if (activeCategory !== 'all') {
      result = result.filter(f => f.category === activeCategory);
    }

    if (filterTab === 'bookmarked') {
      result = result.filter(f => bookmarkedIds.has(f.id));
    } else if (filterTab === 'downloaded') {
      const recentIds = new Set(recentDownloads.map((d: any) => d.id));
      result = result.filter(f => recentIds.has(f.id));
    }

    if (selectedSubject) {
      result = result.filter(f => f.subject === selectedSubject);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.title.toLowerCase().includes(q) ||
        (f.subject && f.subject.toLowerCase().includes(q))
      );
    }

    result = sortFiles(result, sortBy);
    setFilteredFiles(result);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = filteredFiles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'size-desc', label: 'Size (Largest)' },
    { value: 'size-asc', label: 'Size (Smallest)' },
    { value: 'subject-asc', label: 'Subject A-Z' },
  ];

  const getSortLabel = () => sortOptions.find(o => o.value === sortBy)?.label || 'Sort';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnnouncementBanner />
        {/* Recent Downloads */}
        {recentDownloads.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-primary" />
              <h2 className="text-lg font-bold font-poppins text-textPrimary">Recent Downloads</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recentDownloads.slice(0, 8).map((file: any) => (
                <div
                  key={file.id}
                  className="flex-shrink-0 w-48 p-3 glass-card cursor-pointer hover:shadow-md transition-shadow"
                  title={file.title}
                >
                  <p className="text-sm font-semibold font-poppins text-textPrimary truncate">{file.title}</p>
                  <p className="text-xs text-textSecondary font-inter truncate">{file.subject || 'General'}</p>
                  <p className="text-[10px] text-textSecondary font-inter mt-1">
                    {new Date(file.downloadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </div>
          <div className="flex items-center gap-2">
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
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white/50 border border-primary/10 rounded-2xl text-textSecondary hover:text-primary hover:border-primary/30 transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filter tabs + Subject */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-sm font-inter transition-all ${filterTab === 'all' ? 'bg-primary text-white' : 'bg-white/50 border border-primary/10 text-textSecondary hover:text-primary'}`}
            >
              All Notes
            </button>
            <button
              onClick={() => setFilterTab('bookmarked')}
              className={`px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-1.5 transition-all ${filterTab === 'bookmarked' ? 'bg-primary text-white' : 'bg-white/50 border border-primary/10 text-textSecondary hover:text-primary'}`}
            >
              <Heart size={14} />
              Bookmarked
            </button>
            <button
              onClick={() => setFilterTab('downloaded')}
              className={`px-4 py-2 rounded-xl text-sm font-inter flex items-center gap-1.5 transition-all ${filterTab === 'downloaded' ? 'bg-primary text-white' : 'bg-white/50 border border-primary/10 text-textSecondary hover:text-primary'}`}
            >
              <Download size={14} />
              Downloaded
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="px-4 py-2 bg-white/50 border border-primary/10 rounded-xl text-sm font-inter text-textSecondary hover:text-primary flex items-center gap-2 transition-all"
            >
              <ArrowUpDown size={14} />
              {getSortLabel()}
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-primary/10 py-2 min-w-[180px]">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-inter hover:bg-primary/5 transition-colors ${sortBy === opt.value ? 'text-primary font-semibold' : 'text-textSecondary'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Subject Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin -mx-2 px-2">
          <button
            onClick={() => setSelectedSubject('')}
            className={`px-4 py-1.5 rounded-full text-xs font-inter font-semibold whitespace-nowrap transition-all shrink-0 ${
              !selectedSubject
                ? 'bg-secondary/20 text-secondary border border-secondary/30'
                : 'bg-white/50 border border-primary/10 text-textSecondary hover:text-primary'
            }`}
          >
            All Subjects
          </button>
          {SUBJECTS.map(subject => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-1.5 rounded-full text-xs font-inter font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedSubject === subject
                  ? 'bg-secondary/20 text-secondary border border-secondary/30'
                  : 'bg-white/50 border border-primary/10 text-textSecondary hover:text-primary'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-textSecondary space-y-4">
            <WifiOff size={48} className="opacity-30" />
            <p className="text-lg font-inter text-center max-w-md">{error}</p>
            <button onClick={handleRefresh} className="btn-primary px-6 py-3">
              <RefreshCw size={18} className="inline mr-2" />
              Try Again
            </button>
          </div>
        )}

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
        ) : !error ? (
          <>
            {filteredFiles.length > 0 ? (
              <>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {paginatedFiles.map((file) => (
                      <FileCard key={file.id} file={file} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-10">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-xl bg-white/50 border border-primary/10 text-textSecondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-inter text-textSecondary">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-xl bg-white/50 border border-primary/10 text-textSecondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-textSecondary space-y-4">
                <Info size={48} className="opacity-20" />
                <p className="text-xl font-inter">No resources found matching your criteria.</p>
              </div>
            )}
          </>
        ) : null}
      </main>
      <footer className="py-8 border-t border-primary/10 text-center text-textSecondary font-inter mt-auto">
        <p>© 2026 CSMU Cloud Notes | Chhatrapati Shivaji Maharaj University</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
