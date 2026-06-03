import React from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, User, Shield } from 'lucide-react';
import { logout } from '../services/authService';
import { toast } from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-start justify-center">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user?.displayName || 'Profile'} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-primary" />
              )}
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold font-poppins text-textPrimary">
                {user?.displayName || 'User'}
              </h1>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {isAdmin ? (
                  <span className="flex items-center gap-1 text-sm text-secondary font-semibold font-inter">
                    <Shield size={14} /> Admin
                  </span>
                ) : (
                  <span className="text-sm text-textSecondary font-inter">Student</span>
                )}
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-white/50 rounded-xl">
                <Mail size={18} className="text-textSecondary" />
                <span className="text-sm font-inter text-textPrimary">{user?.email || 'No email'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <footer className="py-8 border-t border-primary/10 text-center text-textSecondary font-inter mt-auto">
        <p>© 2026 CSMU Cloud Notes | Chhatrapati Shivaji Maharaj University</p>
      </footer>
    </div>
  );
};

export default ProfilePage;
