import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Calendar, User, Book, Eye, X, Heart, Share2, Wifi, Image, FileSpreadsheet, FilePenLine } from 'lucide-react';
import { auth } from '../../config/firebase';
import { getDownloadUrl, downloadFile, addBookmark, removeBookmark, fetchBookmarks, isLocallyBookmarked, toggleLocalBookmark, addRecentDownload, cacheFileForOffline, isFileCachedOffline, logDownload as logDownloadApi, getPreviewBlob } from '../../services/fileService';
import { toast } from 'react-hot-toast';

interface FileCardProps {
  file: any;
}

const isImageType = (mimeType?: string) => {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
};

const isOfficeDoc = (mimeType?: string) => {
  if (!mimeType) return false;
  return mimeType.includes('officedocument') || mimeType.includes('ms-powerpoint') || mimeType.includes('ms-excel') || mimeType === 'application/msword';
};

const isPdfType = (mimeType?: string, fileName?: string) => {
  if (mimeType === 'application/pdf') return true;
  if (fileName?.toLowerCase().endsWith('.pdf')) return true;
  return false;
};

const getOfficeIcon = (mimeType: string) => {
  if (mimeType.includes('spreadsheet') || mimeType.includes('ms-excel')) return FileSpreadsheet;
  if (mimeType.includes('presentation') || mimeType.includes('ms-powerpoint')) return FileText;
  return FilePenLine;
};

const getPreviewButtonLabel = (mimeType?: string) => {
  if (!mimeType) return 'View';
  if (mimeType.startsWith('image/')) return 'Preview';
  if (isPdfType(mimeType)) return 'View';
  if (isOfficeDoc(mimeType)) return 'Preview';
  return 'View';
};

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'office' | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [cachedOffline, setCachedOffline] = useState(false);

  const fileType = file.file_type;

  const canPreview = isPdfType(fileType, file.file_name) || isImageType(fileType) || isOfficeDoc(fileType);

  useEffect(() => {
    checkBookmarkStatus();
    checkOfflineCache();
  }, []);

  const checkBookmarkStatus = async () => {
    const local = isLocallyBookmarked(file.id);
    if (local) {
      setBookmarked(true);
    }
    try {
      const bookmarks = await fetchBookmarks();
      const found = bookmarks.find((b: any) => b.file_id === file.id);
      if (found) {
        setBookmarked(true);
        setBookmarkId(found.id);
      }
    } catch {
      // fallback to localStorage
    }
  };

  const checkOfflineCache = async () => {
    const cached = await isFileCachedOffline(file.id);
    setCachedOffline(cached);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarked) {
      if (bookmarkId) {
        try {
          await removeBookmark(bookmarkId);
        } catch {}
      }
      toggleLocalBookmark(file.id);
      setBookmarked(false);
      setBookmarkId(null);
      toast.success('Removed from bookmarks');
    } else {
      try {
        const result = await addBookmark(file.id);
        setBookmarkId(result.id);
        setBookmarked(true);
      } catch {
        toggleLocalBookmark(file.id);
        setBookmarked(true);
      }
      toast.success('Added to bookmarks');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: file.title,
      text: `Check out "${file.title}" on CSMU Cloud Notes${file.subject ? ` - ${file.subject}` : ''}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.text);
      toast.success('Copied to clipboard');
    }
  };

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
      addRecentDownload(file);
      recordDownload(file.id, blob);
      toast.success('Download complete!');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const recordDownload = async (fileId: string, blob: Blob) => {
    try {
      await logDownloadApi({ file_id: fileId, file_title: file.title, file_category: file.category, file_size: file.file_size });
      cacheFileForOffline(fileId, blob);
      setCachedOffline(true);
    } catch {}
  };

  const handlePreview = async () => {
    try {
      if (isPdfType(fileType, file.file_name)) {
        const token = await auth.currentUser?.getIdToken();
        if (!token) { toast.error('Not authenticated'); return; }
        const API_URL = import.meta.env.VITE_RAILWAY_API_URL;
        setPreviewType('pdf');
        setPreviewUrl(`${API_URL}/api/files/${file.id}/preview?token=${encodeURIComponent(token)}`);
      } else if (fileType && isImageType(fileType)) {
        const { blob } = await getPreviewBlob(file.id);
        setPreviewUrl(URL.createObjectURL(blob));
        setPreviewType('image');
        setImageLoaded(false);
      } else if (isOfficeDoc(fileType)) {
        const token = await auth.currentUser?.getIdToken();
        if (!token) { toast.error('Not authenticated'); return; }
        const API_URL = import.meta.env.VITE_RAILWAY_API_URL;
        setPreviewType('office');
        setPreviewUrl(`${API_URL}/api/files/${file.id}/preview?token=${encodeURIComponent(token)}`);
      } else {
        toast.error('Preview not available');
        return;
      }
      setShowPreview(true);
    } catch {
      toast.error('Failed to open preview');
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl('');
    setPreviewType(null);
    setImageLoaded(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const OfficeIcon = fileType && isOfficeDoc(fileType) ? getOfficeIcon(fileType) : FileText;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card p-6 flex flex-col gap-4 group relative"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {cachedOffline && (
            <span className="p-1.5 text-green-500" title="Available offline">
              <Wifi size={14} />
            </span>
          )}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full transition-colors ${bookmarked ? 'text-red-500' : 'text-textSecondary opacity-0 group-hover:opacity-100'}`}
            title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Heart size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full text-textSecondary opacity-0 group-hover:opacity-100 transition-colors hover:text-primary"
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>

        <div className="flex justify-between items-start">
          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
            {isImageType(fileType) ? (
              <Image size={24} />
            ) : isOfficeDoc(fileType) ? (
              <OfficeIcon size={24} />
            ) : (
              <FileText size={24} />
            )}
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
          {canPreview && (
            <button
              onClick={handlePreview}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 text-sm"
            >
              <Eye size={16} />
              <span>{getPreviewButtonLabel(fileType)}</span>
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 ${canPreview ? 'flex-1' : 'w-full'}`}
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
        {showPreview && previewUrl && previewType === 'pdf' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-lg">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-white shrink-0" />
                <span className="text-white font-medium truncate">{file.title}</span>
              </div>
              <button onClick={closePreview} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <iframe
              src={previewUrl}
              className="flex-1 w-full"
              title={file.title}
            />
          </motion.div>
        )}

        {showPreview && previewUrl && previewType === 'image' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
            onClick={closePreview}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-lg">
              <div className="flex items-center gap-3 min-w-0">
                <Image size={20} className="text-white shrink-0" />
                <span className="text-white font-medium truncate">{file.title}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); closePreview(); }} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8" onClick={(e) => e.stopPropagation()}>
              {!imageLoaded && (
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              )}
              <motion.img
                src={previewUrl}
                alt={file.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.95 }}
                transition={{ duration: 0.2 }}
                onLoad={() => setImageLoaded(true)}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
            </div>
            <div className="flex justify-center gap-4 px-4 py-3 bg-black/30 backdrop-blur-lg">
              <a
                href={previewUrl}
                download={file.file_name || file.title}
                className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm"
              >
                <Download size={16} />
                Download Image
              </a>
            </div>
          </motion.div>
        )}

        {showPreview && previewUrl && previewType === 'office' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-lg">
              <div className="flex items-center gap-3 min-w-0">
                <OfficeIcon size={20} className="text-white shrink-0" />
                <span className="text-white font-medium truncate">{file.title}</span>
              </div>
              <button onClick={closePreview} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true&chrome=false`}
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
