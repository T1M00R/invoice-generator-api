const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const invoiceRoutes = require('./routes/invoiceRoutes');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', invoiceRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Invoice Generator API running on port ${PORT}`);
});

module.exports = app; 