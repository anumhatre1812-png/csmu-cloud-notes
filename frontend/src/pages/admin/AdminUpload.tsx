import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { motion } from 'framer-motion';
import { Upload, File, CheckCircle2 } from 'lucide-react';
import { uploadFileApi } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('notes');
  const [subject, setSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !category) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('subject', subject);

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading('Uploading file...');

    try {
      await uploadFileApi(formData, setUploadProgress);
      toast.success('File uploaded successfully', { id: toastId });
      navigate('/admin/manage');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Upload size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-poppins text-textPrimary">Upload Resource</h1>
            <p className="text-textSecondary font-inter text-sm">Add new academic materials to the cloud.</p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUpload}
          className="glass-card p-8 space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold font-poppins text-textSecondary px-1">File Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. OS Unit 2 Lecture Notes"
                className="w-full px-4 py-3 bg-white/50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold font-poppins text-textSecondary px-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-4 py-3 bg-white/50 border border-primary/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-inter"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold font-poppins text-textSecondary px-1">Category *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: 'notes', label: 'Notes' },
                { id: 'assignments', label: 'Assignments' },
                { id: 'lab-manuals', label: 'Lab Manuals' },
                { id: 'question-papers', label: 'Papers' },
                { id: 'question-bank', label: 'Q-Bank' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold font-montserrat uppercase transition-all ${
                    category === cat.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white/50 border border-primary/5 text-textSecondary hover:bg-primary/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold font-poppins text-textSecondary px-1">File Material *</label>
            <div className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
              file ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30'
            }`}>
              <input
                type="file"
                required
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-primary text-white rounded-full">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-textPrimary truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-textSecondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 text-textSecondary">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <File size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Click or drag file to upload</p>
                    <p className="text-xs">PDF, DOCX, PPTX, XLSX or Images (Max 50MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50"
          >
            {isUploading ? 'Uploading Please Wait...' : 'Confirm and Upload'}
          </button>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold font-inter text-textSecondary">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-primary/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}
        </motion.form>
      </main>
    </div>
  );
};

export default AdminUpload;
