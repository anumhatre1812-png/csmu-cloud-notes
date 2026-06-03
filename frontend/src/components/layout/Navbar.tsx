import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Upload, Settings, Menu, X, User } from 'lucide-react';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Stats' },
    { to: '/admin/upload', icon: Upload, label: 'Upload' },
    { to: '/admin/manage', icon: Settings, label: 'Manage' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-primary/10 px-4 sm:px-6 py-4">
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

          <div className="flex min-w-0 items-center gap-2 sm:gap-6">
            {isAdmin && (
              <div className="hidden md:flex items-center gap-4">
                {adminLinks.map(link => (
                  <Link key={link.to} to={link.to} className="text-textSecondary hover:text-primary transition-colors flex items-center gap-2">
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link to="/profile" className="hidden md:flex text-textSecondary hover:text-primary transition-colors items-center gap-1.5" title="Profile">
              <User size={20} />
            </Link>

            <div className="flex items-center gap-2 pl-2 sm:pl-6 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold font-poppins text-textPrimary">{user?.displayName}</p>
                <p className="text-xs text-textSecondary font-inter">{isAdmin ? 'Admin' : 'Student'}</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 text-textSecondary hover:text-primary transition-colors"
                  title="Menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}

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

      {mobileOpen && isAdmin && (
        <div className="fixed inset-x-0 top-[73px] z-40 bg-white/95 backdrop-blur-lg border-b border-primary/10 md:hidden">
          <div className="flex flex-col p-4 gap-2">
            {adminLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-textSecondary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <link.icon size={20} />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
