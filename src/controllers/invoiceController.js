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

module.exports = {
  generateInvoice
}; 