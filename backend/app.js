require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
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
const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const transferRoutes = require('./routes/transferRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const auditRoutes = require('./routes/auditRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
