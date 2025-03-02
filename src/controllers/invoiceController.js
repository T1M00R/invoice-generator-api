const { generateInvoicePDF } = require('../services/pdfGenerator');

const generateInvoice = async (req, res, next) => {
  try {
    const invoiceData = req.body;
    
    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoiceData.invoice.invoiceNumber}.pdf`);
    
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

const generateInvoiceJson = async (req, res, next) => {
  try {
    const invoiceData = req.body;
    
    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    const taxRate = invoiceData.tax?.rate || 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    // Return the invoice data with calculated totals
    return res.json({
      ...invoiceData,
      calculated: {
        subtotal,
        taxAmount,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInvoice,
  generateInvoiceJson
}; 