import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({
  origin: frontendUrl === '*' ? true : frontendUrl
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
import uploadRoutes from './routes/upload.route.js';
import deleteRoutes from './routes/delete.route.js';
import statsRoutes from './routes/stats.route.js';
import filesRoutes from './routes/files.route.js';

app.use('/api/files', filesRoutes);
app.use('/api/files', uploadRoutes);
app.use('/api/files', deleteRoutes);
app.use('/api/admin', statsRoutes);

export default app;
