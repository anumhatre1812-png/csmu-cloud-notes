import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Shield, Download } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-poppins text-textPrimary">
              CSMU <span className="text-primary">Cloud Notes</span>
            </h1>
            <p className="mt-6 text-xl text-textSecondary max-w-2xl font-inter">
              Secure, centralized, and instant access to all your academic resources. 
              Designed specifically for Chhatrapati Shivaji Maharaj University students.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-10 py-4"
            >
              Login to Access Notes
            </button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: Shield, title: "Secure", desc: "Admin-verified content only." },
              { icon: BookOpen, title: "Organized", desc: "Structured by subject and category." },
              { icon: Download, title: "Instant", desc: "One-click downloads for all materials." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.5 }}
                className="glass-card p-8 flex flex-col items-center space-y-4 hover:translate-y-[-4px] transition-transform"
              >
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold font-poppins">{feature.title}</h3>
                <p className="text-textSecondary font-inter">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-primary/10 text-center text-textSecondary font-inter">
        <p>© 2026 CSMU Cloud Notes | Chhatrapati Shivaji Maharaj University</p>
      </footer>
    </div>
  );
};

export default LandingPage;
