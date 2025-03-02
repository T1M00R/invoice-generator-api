const express = require('express');
const router = express.Router();
const { validateInvoiceData } = require('../middleware/validator');
const { generateInvoice, generateInvoiceJson } = require('../controllers/invoiceController');

// Original route for backward compatibility
router.post('/invoices', validateInvoiceData, generateInvoice);

// New routes for different formats
router.post('/invoices/pdf', validateInvoiceData, generateInvoice);
router.post('/invoices/json', validateInvoiceData, generateInvoiceJson);

module.exports = router; 