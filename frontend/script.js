document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('invoiceForm');
  const addItemBtn = document.getElementById('addItemBtn');
  const itemsContainer = document.getElementById('itemsContainer');

  // Set default dates (today and +30 days)
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('invoiceDate').value = today;
  document.getElementById('invoiceDueDate').value = thirtyDaysLater;

  // Auto-generate invoice number (current timestamp)
  document.getElementById('invoiceNumber').value = `INV-${Date.now().toString().substring(4)}`;

  // Add event listeners
  addItemBtn.addEventListener('click', addItem);
  form.addEventListener('submit', generateInvoice);
  
  // Add event listener to the container for removing items (event delegation)
  itemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
      const itemRow = e.target.closest('.item-row');
      if (itemsContainer.children.length > 1) {
        itemRow.remove();
        updateSubtotal();
      } else {
        alert("At least one item is required");
      }
    }
  });

  // Function to add a new item row
  function addItem() {
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    
    itemRow.innerHTML = `
      <div class="form-group">
        <label>Description*</label>
        <input type="text" class="item-description" required>
      </div>
      <div class="form-group">
        <label>Quantity*</label>
        <input type="number" min="1" step="1" class="item-quantity" required>
      </div>
      <div class="form-group">
        <label>Unit Price*</label>
        <input type="number" min="0.01" step="0.01" class="item-price" required>
      </div>
      <button type="button" class="remove-item">Remove</button>
    `;
    
    itemsContainer.appendChild(itemRow);
    updateSubtotal();
  }

  // Add a loading indicator during PDF generation
  function showLoading() {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'loadingIndicator';
    loadingEl.innerHTML = '<div class="spinner"></div><p>Generating invoice...</p>';
    document.body.appendChild(loadingEl);
  }

  function hideLoading() {
    const loadingEl = document.getElementById('loadingIndicator');
    if (loadingEl) loadingEl.remove();
  }

  // Modify the generateInvoice function to show loading
  async function generateInvoice(e) {
    e.preventDefault();
    
    showLoading();
    
    // Collect items
    const items = [];
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
      const description = row.querySelector('.item-description').value;
      const quantity = parseFloat(row.querySelector('.item-quantity').value);
      const unitPrice = parseFloat(row.querySelector('.item-price').value);
      
      items.push({
        description,
        quantity,
        unitPrice
      });
    });
    
    // Tax rate from percentage to decimal
    let taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    taxRate = taxRate / 100;
    
    // Build the invoice data
    const invoiceData = {
      client: {
        name: document.getElementById('clientName').value,
        address: document.getElementById('clientAddress').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value
      },
      invoice: {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('invoiceDueDate').value
      },
      items: items,
      tax: {
        rate: taxRate,
        description: document.getElementById('taxDescription').value
      },
      notes: document.getElementById('notes').value
    };
    
    try {
      // Send the data to the API
      const response = await fetch('http://localhost:3000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate invoice');
      }
      
      // Get the PDF as blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link to download the PDF
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoiceData.invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      hideLoading();
      showSuccessMessage(invoiceData.invoice.invoiceNumber);
      
    } catch (error) {
      hideLoading();
      alert(`Error: ${error.message}`);
      console.error('Error generating invoice:', error);
    }
  }

  // Success message
  function showSuccessMessage(invoiceNumber) {
    const successEl = document.createElement('div');
    successEl.id = 'successMessage';
    successEl.innerHTML = `<div class="success-content">
      <h3>Invoice Generated!</h3>
      <p>Invoice #${invoiceNumber} has been generated and downloaded.</p>
      <button id="newInvoiceBtn">Create New Invoice</button>
    </div>`;
    
    document.body.appendChild(successEl);
    
    document.getElementById('newInvoiceBtn').addEventListener('click', () => {
      successEl.remove();
      document.getElementById('invoiceForm').reset();
      // Set default dates and invoice number again
      document.getElementById('invoiceDate').value = today;
      document.getElementById('invoiceDueDate').value = thirtyDaysLater;
      document.getElementById('invoiceNumber').value = `INV-${Date.now().toString().substring(4)}`;
      
      // Reset to one item
      const itemsContainer = document.getElementById('itemsContainer');
      while (itemsContainer.children.length > 1) {
        itemsContainer.removeChild(itemsContainer.lastChild);
      }
      
      // Clear item values
      const firstItem = itemsContainer.firstChild;
      firstItem.querySelector('.item-description').value = '';
      firstItem.querySelector('.item-quantity').value = '';
      firstItem.querySelector('.item-price').value = '';
    });
  }

  // Add live calculations as items change
  function updateSubtotal() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const unitPrice = parseFloat(row.querySelector('.item-price').value) || 0;
      subtotal += quantity * unitPrice;
    });
    
    const taxRate = (parseFloat(document.getElementById('taxRate').value) || 0) / 100;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    // Update the display
    const summaryEl = document.getElementById('invoiceSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="summary-row"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Tax (${(taxRate * 100).toFixed(0)}%):</span><span>$${taxAmount.toFixed(2)}</span></div>
        <div class="summary-row total"><span>Total:</span><span>$${total.toFixed(2)}</span></div>
      `;
    }
  }

  // Add event listeners for live updates
  document.addEventListener('input', e => {
    if (e.target.classList.contains('item-quantity') || 
        e.target.classList.contains('item-price') ||
        e.target.id === 'taxRate') {
      updateSubtotal();
    }
  });
}); 