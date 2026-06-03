import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Calendar, User, Book, Eye, X } from 'lucide-react';
import { getDownloadUrl, downloadFile } from '../../services/fileService';
import { toast } from 'react-hot-toast';

interface FileCardProps {
  file: any;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const url = await getDownloadUrl(file.id);
      const { blob, filename } = await downloadFile(url, setDownloadProgress);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || file.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download complete!');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleViewPdf = async () => {
    try {
      const url = await getDownloadUrl(file.id);
      setPdfUrl(url);
      setShowPdf(true);
    } catch {
      toast.error('Failed to open file');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPdf = file.file_name?.endsWith('.pdf');

  return (
    <>
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
            <span className="truncate">{file.uploader_name?.split(' ')[0] || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-textSecondary text-xs font-inter justify-end">
            <Calendar size={12} />
            <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}</span>
          </div>
          <div className="text-textSecondary text-xs font-inter">
            {formatSize(file.file_size)}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {isPdf && (
            <button
              onClick={handleViewPdf}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 text-sm"
            >
              <Eye size={16} />
              <span>View</span>
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 ${isPdf ? 'flex-1' : 'w-full'}`}
          >
            {isDownloading ? (
              <span className="text-sm">{downloadProgress}%</span>
            ) : (
              <>
                <Download size={16} />
                <span>Download</span>
              </>
            )}
          </button>
        </div>

        {isDownloading && downloadProgress > 0 && (
          <div className="h-2 rounded-full bg-primary/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${downloadProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showPdf && pdfUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-lg">
              <span className="text-white font-medium truncate">{file.title}</span>
              <button onClick={() => { setShowPdf(false); setPdfUrl(''); }} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <iframe
              src={pdfUrl}
              className="flex-1 w-full"
              title={file.title}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FileCard;
