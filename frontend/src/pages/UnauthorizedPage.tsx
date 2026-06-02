import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md p-10 space-y-6"
      >
        <div className="flex justify-center text-red-500">
          <ShieldAlert size={64} />
        </div>
        <h1 className="text-3xl font-bold font-poppins text-textPrimary">Access Denied</h1>
        <p className="text-textSecondary font-inter">
          You do not have administrative privileges to access this page. 
          If you believe this is an error, please contact the system administrator.
        </p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="btn-primary w-full"
        >
          Back to Student Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
