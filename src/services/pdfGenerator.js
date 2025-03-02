const PDFDocument = require('pdfkit');

function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      
      const taxRate = invoiceData.tax?.rate || 0;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;
      
      // Create a buffer to store PDF
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Add content to PDF
      generateHeader(doc, invoiceData);
      generateCustomerInformation(doc, invoiceData);
      generateInvoiceTable(doc, invoiceData, subtotal, taxAmount, total);
      generateFooter(doc, invoiceData);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateHeader(doc, invoiceData) {
  // Add logo if provided
  if (invoiceData.company?.logo) {
    try {
      const logoImg = invoiceData.company.logo.split(',')[1]; // Get base64 data
      doc.image(Buffer.from(logoImg, 'base64'), 50, 45, { width: 80 });
      // Adjust position if logo is present
      doc
        .fontSize(20)
        .text('INVOICE', 150, 45)
        .fontSize(10)
        .text(invoiceData.company.name, 150, 70)
        .text(`Invoice Number: ${invoiceData.invoice.invoiceNumber}`, 150, 85)
        .text(`Date: ${formatDate(invoiceData.invoice.date)}`, 150, 100)
        .text(`Due Date: ${formatDate(invoiceData.invoice.dueDate)}`, 150, 115)
        .moveDown();
    } catch (err) {
      console.error('Error rendering logo:', err);
      // Fallback to text-only header
      renderTextHeader();
    }
  } else {
    renderTextHeader();
  }
  
  function renderTextHeader() {
    doc
      .fontSize(20)
      .text('INVOICE', 50, 45)
      .fontSize(10)
      .text(invoiceData.company?.name || '', 50, 70)
      .text(`Invoice Number: ${invoiceData.invoice.invoiceNumber}`, 50, 85)
      .text(`Date: ${formatDate(invoiceData.invoice.date)}`, 50, 100)
      .text(`Due Date: ${formatDate(invoiceData.invoice.dueDate)}`, 50, 115)
      .moveDown();
  }
}

function generateCustomerInformation(doc, invoiceData) {
  doc
    .fontSize(14)
    .text('Bill To:', 50, 160)
    .fontSize(10)
    .text(invoiceData.client.name, 50, 180)
    .text(invoiceData.client.address, 50, 195)
    .text(invoiceData.client.email, 50, 210)
    .text(invoiceData.client.phone || '', 50, 225)
    .moveDown();
}

function generateInvoiceTable(doc, invoiceData, subtotal, taxAmount, total) {
  const invoiceTableTop = 300;
  
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Description',
    'Quantity',
    'Unit Price',
    'Line Total'
  );
  
  generateHr(doc, invoiceTableTop + 20);
  
  let position = invoiceTableTop + 30;
  
  doc.font('Helvetica');
  
  invoiceData.items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    
    generateTableRow(
      doc,
      position,
      item.description,
      item.quantity,
      formatCurrency(item.unitPrice, invoiceData.currency),
      formatCurrency(lineTotal, invoiceData.currency)
    );
    
    position += 20;
  });
  
  generateHr(doc, position);
  
  // Subtotal
  position += 20;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    position,
    '',
    '',
    'Subtotal',
    formatCurrency(subtotal, invoiceData.currency)
  );
  
  // Tax
  position += 20;
  const taxDesc = invoiceData.tax?.description || 'Tax';
  generateTableRow(
    doc,
    position,
    '',
    '',
    `${taxDesc} (${formatPercentage(invoiceData.tax?.rate || 0)})`,
    formatCurrency(taxAmount, invoiceData.currency)
  );
  
  // Total
  position += 20;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    position,
    '',
    '',
    'Total',
    formatCurrency(total, invoiceData.currency)
  );
}

function generateFooter(doc, invoiceData) {
  doc
    .fontSize(10)
    .text('Thank you for your business!', 50, 700, { align: 'center' });
  
  if (invoiceData.notes) {
    doc
      .moveDown()
      .fontSize(10)
      .text('Notes:', 50)
      .text(invoiceData.notes, 50);
  }
}

function generateTableRow(doc, y, desc, qty, unitPrice, lineTotal) {
  doc
    .fontSize(10)
    .text(desc, 50, y)
    .text(qty, 250, y, { width: 50, align: 'center' })
    .text(unitPrice, 350, y, { width: 90, align: 'right' })
    .text(lineTotal, 450, y, { width: 90, align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#CCCCCC')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatDate(date) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
}

function formatCurrency(amount, currencyCode = 'USD') {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  };
  
  return (symbols[currencyCode] || '$') + amount.toFixed(2);
}

function formatPercentage(decimal) {
  return (decimal * 100).toFixed(1) + '%';
}

module.exports = { generateInvoicePDF }; 