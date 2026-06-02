import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Upload, Settings } from 'lucide-react';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-primary/10 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3 text-xl sm:text-2xl font-bold font-poppins text-primary">
          <img
            src="/favicon-32x32.png"
            alt=""
            className="h-8 w-8 shrink-0 rounded-lg"
          />
          <span className="truncate">
            CSMU <span className="text-textPrimary">Notes</span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          {isAdmin && (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/admin/dashboard" className="text-textSecondary hover:text-primary transition-colors flex items-center gap-2">
                <LayoutDashboard size={20} />
                <span>Stats</span>
              </Link>
              <Link to="/admin/upload" className="text-textSecondary hover:text-primary transition-colors flex items-center gap-2">
                <Upload size={20} />
                <span>Upload</span>
              </Link>
              <Link to="/admin/manage" className="text-textSecondary hover:text-primary transition-colors flex items-center gap-2">
                <Settings size={20} />
                <span>Manage</span>
              </Link>
            </div>
          )}
          
          <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-gray-200">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold font-poppins text-textPrimary">{user?.displayName}</p>
              <p className="text-xs text-textSecondary font-inter">{isAdmin ? 'Admin' : 'Student'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-textSecondary hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
