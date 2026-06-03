import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAnnouncementsApi, createAnnouncementApi, updateAnnouncementApi, deleteAnnouncementApi } from '../../services/apiService';
import { Megaphone, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncementsApi();
      setAnnouncements(data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setShowForm(true);
  };

  const openEdit = (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateAnnouncementApi(editingId, { title: title.trim(), content: content.trim() });
        setAnnouncements(prev => prev.map(a => a.id === editingId ? updated : a));
        toast.success('Announcement updated');
      } else {
        const created = await createAnnouncementApi({ title: title.trim(), content: content.trim() });
        setAnnouncements(prev => [created, ...prev]);
        toast.success('Announcement created');
      }
      closeForm();
    } catch {
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncementApi(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Announcement deleted');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
              <Megaphone size={28} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold font-poppins text-textPrimary">Announcements</h1>
              <p className="text-textSecondary font-inter text-sm">Manage notices for students</p>
            </div>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center justify-center gap-2 px-5 py-3 text-sm w-full sm:w-auto">
            <Plus size={18} />
            New Announcement
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-32 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {announcements.map(a => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold font-poppins text-textPrimary">{a.title}</h3>
                      <p className="mt-2 text-sm font-inter text-textSecondary whitespace-pre-wrap">{a.content}</p>
                      <div className="flex items-center gap-3 mt-4 text-xs text-textSecondary font-inter">
                        <span>Posted by {a.created_by?.split('@')[0]}</span>
                        <span>•</span>
                        <span>{formatDate(a.created_at)}</span>
                        {a.updated_at !== a.created_at && (
                          <>
                            <span>•</span>
                            <span>Edited {formatDate(a.updated_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-2 text-textSecondary hover:text-primary transition-colors rounded-xl hover:bg-primary/5"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 text-textSecondary hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-textSecondary">
            <Megaphone size={48} className="opacity-20" />
            <p className="mt-4 text-lg font-inter">No announcements yet.</p>
            <button onClick={openCreate} className="btn-primary mt-6 px-6 py-3">Create the first one</button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleSave}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-poppins text-textPrimary">
                  {editingId ? 'Edit Announcement' : 'New Announcement'}
                </h2>
                <button type="button" onClick={closeForm} className="p-1 text-textSecondary hover:text-textPrimary">
                  <X size={20} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold font-inter text-textPrimary mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-2.5 bg-white/50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold font-inter text-textPrimary mb-1.5">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white/50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter resize-none"
                  placeholder="Write your announcement..."
                  required
                />
                <p className="text-xs text-textSecondary font-inter mt-1 text-right">{content.length}/2000</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 btn-secondary py-2.5">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2">
                  <Save size={16} />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Publish'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAnnouncements;
