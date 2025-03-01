const express = require('express');
const router = express.Router();
const { validateInvoiceData } = require('../middleware/validator');
const { generateInvoice } = require('../controllers/invoiceController');

router.post('/invoices', validateInvoiceData, generateInvoice);

module.exports = router; 