const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
  doc
    .fontSize(20)
    .text('INVOICE', 50, 45)
    .fontSize(10)
    .text(`Invoice Number: ${invoiceData.invoice.invoiceNumber}`, 50, 80)
    .text(`Date: ${formatDate(invoiceData.invoice.date)}`, 50, 95)
    .text(`Due Date: ${formatDate(invoiceData.invoice.dueDate)}`, 50, 110)
    .moveDown();
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
  
  doc.font('Helvetica');
  
  let position = invoiceTableTop + 30;
  
  invoiceData.items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    generateTableRow(
      doc,
      position,
      item.description,
      item.quantity,
      formatCurrency(item.unitPrice),
      formatCurrency(lineTotal)
    );
    position += 30;
  });
  
  generateTableRow(
    doc,
    position,
    '',
    '',
    'Subtotal',
    formatCurrency(subtotal)
  );
  
  position += 30;
  
  const taxDesc = invoiceData.tax?.description || 'Tax';
  generateTableRow(
    doc,
    position,
    '',
    '',
    `${taxDesc} (${formatPercentage(invoiceData.tax?.rate || 0)})`,
    formatCurrency(taxAmount)
  );
  
  position += 30;
  
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    position,
    '',
    '',
    'Total',
    formatCurrency(total)
  );
  doc.font('Helvetica');
}

function generateFooter(doc, invoiceData) {
  if (invoiceData.notes) {
    doc
      .moveDown(4)
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

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

function formatPercentage(decimal) {
  return (decimal * 100).toFixed(0) + '%';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

module.exports = { generateInvoicePDF }; 