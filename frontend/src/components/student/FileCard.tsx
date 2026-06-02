import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar, User, Book } from 'lucide-react';
import { getDownloadUrl } from '../../services/fileService';
import { toast } from 'react-hot-toast';

interface FileCardProps {
  file: any;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card p-6 flex flex-col gap-4 group"
    >
      <div className="flex justify-between items-start">
        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <FileText size={24} />
        </div>
        <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold font-montserrat rounded-full uppercase">
          {file.category.replace('-', ' ')}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold font-poppins text-textPrimary line-clamp-1" title={file.title}>
          {file.title}
        </h3>
        <div className="flex items-center gap-2 text-textSecondary text-sm font-inter">
          <Book size={14} />
          <span>{file.subject || 'General'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-primary/5">
        <div className="flex items-center gap-2 text-textSecondary text-xs font-inter">
          <User size={12} />
          <span className="truncate">{file.uploader_name.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2 text-textSecondary text-xs font-inter justify-end">
          <Calendar size={12} />
          <span>{new Date(file.created_at).toLocaleDateString()}</span>
        </div>
        <div className="text-textSecondary text-xs font-inter">
          {formatSize(file.file_size)}
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="mt-2 w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        {isDownloading ? (
          <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Download size={18} />
            <span>Download</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default FileCard;
