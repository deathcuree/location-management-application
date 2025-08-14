import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth';
import locationRoutes from './routes/locations';
import uploadRoutes from './routes/upload';

dotenv.config();

const app = express();

// Middleware
app.use(cookieParser());
const allowedOrigins = process.env.CLIENT_URL?.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'location-management-backend' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/upload', uploadRoutes);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err?.status || 500;
  res.status(status).json({
    error: err?.message || 'Internal Server Error',
  });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

export default app;