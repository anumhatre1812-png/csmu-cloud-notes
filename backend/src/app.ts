import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const mobileOrigins = ['capacitor://localhost', 'https://localhost', 'http://localhost'];
const corsOrigins = [...new Set([...allowedOrigins, ...mobileOrigins])];

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'self'", ...allowedOrigins, 'capacitor://localhost'],
    },
  },
}));
app.use(cors({
  origin: allowedOrigins.includes('*')
    ? true
    : (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'));
      }
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check (before rate limiter so it's always accessible)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
});
app.use(limiter);

// Routes
import uploadRoutes from './routes/upload.route.js';
import deleteRoutes from './routes/delete.route.js';
import statsRoutes from './routes/stats.route.js';
import filesRoutes from './routes/files.route.js';
import bookmarksRoutes from './routes/bookmarks.route.js';
import downloadsRoutes from './routes/downloads.route.js';
import activityRoutes from './routes/activity.route.js';
import announcementsRoutes from './routes/announcements.route.js';
import notificationsRoutes from './routes/notifications.route.js';

app.use('/api/files', filesRoutes);
app.use('/api/files', uploadRoutes);
app.use('/api/files', deleteRoutes);
app.use('/api/admin', statsRoutes);
app.use('/api/admin', activityRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/downloads', downloadsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/notifications', notificationsRoutes);

export default app;
