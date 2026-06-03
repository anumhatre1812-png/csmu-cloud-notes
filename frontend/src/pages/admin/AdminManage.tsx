import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Edit3, ExternalLink, FileText, Save, Search, Trash2, X } from 'lucide-react';
import { fetchFiles } from '../../services/fileService';
import { deleteFileApi, updateFileMetadataApi } from '../../services/apiService';
import { toast } from 'react-hot-toast';

const AdminManage: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFile, setEditingFile] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingFile, setDeletingFile] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

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

  const openDeleteModal = (file: any) => {
    setDeletingFile(file);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeletingFile(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFile) return;

    const { id } = deletingFile;
    // Optimistic UI update
    const previousFiles = [...files];
    setFiles(files.filter(f => f.id !== id));
    setIsDeleting(true);

    try {
      await deleteFileApi(id);
      toast.success('File deleted successfully');
      setDeletingFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Delete failed');
      setFiles(previousFiles);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (file: any) => {
    setEditingFile(file);
    setEditTitle(file.title);
    setEditSubject(file.subject || '');
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setEditingFile(null);
    setEditTitle('');
    setEditSubject('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingFile) return;

    const title = editTitle.trim();
    const subject = editSubject.trim();

    if (!title) {
      toast.error('File title is required');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving changes...');

    try {
      const updatedFile = await updateFileMetadataApi(editingFile.id, { title, subject });
      setFiles(files.map(file => file.id === updatedFile.id ? updatedFile : file));
      toast.success('File updated', { id: toastId });
      setEditingFile(null);
      setEditTitle('');
      setEditSubject('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.subject && f.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold font-poppins text-textPrimary">Manage Files</h1>
            <p className="text-textSecondary font-inter text-sm">View and delete existing resources.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" size={20} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 border border-primary/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-textSecondary font-poppins text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">File Info</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Uploader</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                <AnimatePresence>
                  {filteredFiles.map((file) => (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="hover:bg-primary/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-textPrimary line-clamp-1">{file.title}</p>
                            <p className="text-xs text-textSecondary">{file.subject || 'No Subject'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-bold font-montserrat rounded uppercase">
                          {file.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary font-inter">
                        {file.uploader_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary font-inter">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-textSecondary hover:text-primary transition-colors"
                            title="View Public Link"
                          >
                            <ExternalLink size={18} />
                          </a>
                          <button
                            onClick={() => openEditModal(file)}
                            className="p-2 text-textSecondary hover:text-primary transition-colors"
                            title="Edit File"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(file)}
                            className="p-2 text-textSecondary hover:text-red-500 transition-colors"
                            title="Delete File"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredFiles.length === 0 && !loading && (
            <div className="py-20 text-center text-textSecondary font-inter">
              No files found.
            </div>
          )}
          
          {loading && (
            <div className="py-20 flex justify-center">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {deletingFile && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-textPrimary/30 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card w-full max-w-lg p-6 space-y-5"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-2xl bg-red-50 p-3 text-red-500">
                  <AlertTriangle size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold font-poppins text-textPrimary">Delete File</h2>
                  <p className="mt-1 text-sm text-textSecondary font-inter">
                    This will remove the file from storage and the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="p-2 text-textSecondary hover:text-red-500 transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-2xl border border-primary/10 bg-white/60 p-4">
                <p className="truncate font-poppins font-semibold text-textPrimary">
                  {deletingFile.title}
                </p>
                <p className="mt-1 text-sm text-textSecondary font-inter">
                  {deletingFile.category?.replace('-', ' ')} • {deletingFile.subject || 'General'}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-2 font-semibold text-white transition-all duration-200 hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingFile && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-textPrimary/30 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={handleSaveEdit}
              className="glass-card w-full max-w-lg p-6 space-y-5"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-poppins text-textPrimary">Edit File</h2>
                  <p className="text-sm text-textSecondary font-inter">
                    Update the visible title and subject.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="p-2 text-textSecondary hover:text-red-500 transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold font-poppins text-textSecondary px-1">
                  File Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold font-poppins text-textSecondary px-1">
                  Subject
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-white/70 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminManage;
