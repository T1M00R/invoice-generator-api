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
app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Invoice Generator API running on port ${PORT}`);
});

module.exports = app; 