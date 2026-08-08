require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the AssetFlow Enterprise API! Use /api/health for system status.' });
});

// Mount routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // auth handles its own tokens

// Protected routes
app.use(authMiddleware);

const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const transferRoutes = require('./routes/transferRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');

app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activity-logs', activityLogRoutes);

module.exports = app;
