import { motion } from 'framer-motion';

const BootScreen = () => {
  return (
    <motion.div
      className="boot-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <motion.div
        className="boot-mark"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <img src="/android-chrome-192x192.png" alt="" className="boot-logo" />
        <div className="boot-copy">
          <p className="boot-title">CSMU Cloud Notes</p>
          <p className="boot-subtitle">Loading your academic resources</p>
        </div>
        <div className="boot-progress" aria-hidden="true">
          <span />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BootScreen;
