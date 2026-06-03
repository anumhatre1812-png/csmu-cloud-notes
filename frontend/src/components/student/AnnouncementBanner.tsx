import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X } from 'lucide-react';
import { fetchAnnouncementsApi } from '../../services/apiService';

const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAnnouncements();
    try {
      const stored = JSON.parse(localStorage.getItem('csmu_dismissed_announcements') || '[]');
      setDismissed(new Set(stored));
    } catch {}
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await fetchAnnouncementsApi();
      setAnnouncements(data);
    } catch {
      // backend might not have announcements table yet
    }
  };

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem('csmu_dismissed_announcements', JSON.stringify([...next]));
  };

  const visible = announcements.filter(a => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      <AnimatePresence>
        {visible.map(a => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 border-l-4 border-primary relative overflow-hidden"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-xl shrink-0 mt-0.5">
                <Megaphone size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold font-poppins text-textPrimary">{a.title}</h4>
                <p className="text-xs font-inter text-textSecondary mt-1 whitespace-pre-wrap">{a.content}</p>
              </div>
              <button
                onClick={() => dismiss(a.id)}
                className="p-1 text-textSecondary hover:text-textPrimary transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBanner;
