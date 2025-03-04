const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const invoiceRoutes = require('./routes/invoiceRoutes');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Or configure your specific domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// API routes
app.use('/api', invoiceRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Route for root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handler
app.use(errorHandler);

// Export the Express app for Vercel serverless
module.exports = app;

// Keep the app.listen for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Invoice Generator API running on port ${PORT}`);
  });
} 