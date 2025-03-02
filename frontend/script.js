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
  
  // Set default company name
  document.getElementById('companyName').value = 'Your Company Name';

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
    
    // Add event listeners to new inputs for live updates
    const newQuantityInput = itemRow.querySelector('.item-quantity');
    const newPriceInput = itemRow.querySelector('.item-price');
    
    newQuantityInput.addEventListener('input', updateSubtotal);
    newPriceInput.addEventListener('input', updateSubtotal);
    
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
  
  // Show success message after generation
  function showSuccessMessage(invoiceNumber) {
    const successEl = document.createElement('div');
    successEl.id = 'successMessage';
    successEl.innerHTML = `
      <div class="success-content">
        <h3>Invoice Generated!</h3>
        <p>Invoice ${invoiceNumber} has been created and downloaded.</p>
        <div class="success-actions">
          <button id="newInvoiceBtn">Create New Invoice</button>
          <button id="closeSuccessBtn">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(successEl);
    
    document.getElementById('newInvoiceBtn').addEventListener('click', () => {
      successEl.remove();
      form.reset();
      // Reset default values
      document.getElementById('invoiceDate').value = today;
      document.getElementById('invoiceDueDate').value = thirtyDaysLater;
      document.getElementById('invoiceNumber').value = `INV-${Date.now().toString().substring(4)}`;
      document.getElementById('companyName').value = 'Your Company Name';
      
      // Reset items
      while (itemsContainer.children.length > 1) {
        itemsContainer.removeChild(itemsContainer.lastChild);
      }
      
      // Clear first item inputs
      const firstItem = itemsContainer.firstChild;
      firstItem.querySelector('.item-description').value = '';
      firstItem.querySelector('.item-quantity').value = '';
      firstItem.querySelector('.item-price').value = '';
      
      updateSubtotal();
    });
    
    document.getElementById('closeSuccessBtn').addEventListener('click', () => {
      successEl.remove();
    });
  }
  
  // Format currency based on selected currency
  function formatCurrency(amount) {
    const currency = document.getElementById('currency').value;
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$'
    };
    
    return symbols[currency] + amount.toFixed(2);
  }
  
  // Update invoice summary in real-time
  function updateSubtotal() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const unitPrice = parseFloat(row.querySelector('.item-price').value) || 0;
      subtotal += quantity * unitPrice;
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    // Update the summary display
    const summaryEl = document.getElementById('invoiceSummary');
    summaryEl.innerHTML = `
      <div class="summary-row"><span>Subtotal:</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="summary-row"><span>Tax (${(taxRate * 100).toFixed(0)}%):</span><span>${formatCurrency(taxAmount)}</span></div>
      <div class="summary-row total"><span>Total:</span><span>${formatCurrency(total)}</span></div>
    `;
  }
  
  // Add event listeners for live updates
  document.getElementById('taxRate').addEventListener('input', updateSubtotal);
  document.getElementById('currency').addEventListener('change', updateSubtotal);
  
  // Initial item inputs should also trigger updates
  const initialQuantityInputs = document.querySelectorAll('.item-quantity');
  const initialPriceInputs = document.querySelectorAll('.item-price');
  
  initialQuantityInputs.forEach(input => {
    input.addEventListener('input', updateSubtotal);
  });
  
  initialPriceInputs.forEach(input => {
    input.addEventListener('input', updateSubtotal);
  });

  // Modify the generateInvoice function to show loading
  async function generateInvoice(e) {
    e.preventDefault();
    
    showLoading();
    
    // Get logo if provided
    const logoInput = document.getElementById('companyLogo');
    let logoData = null;
    
    if (logoInput.files && logoInput.files[0]) {
      const logoFile = logoInput.files[0];
      logoData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(logoFile);
      });
    }
    
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
    
    // Get selected template
    const selectedTemplate = document.querySelector('input[name="template"]:checked').value;
    
    // Get export format
    const exportFormat = document.getElementById('exportFormat').value;
    
    // Build the invoice data
    const invoiceData = {
      company: {
        name: document.getElementById('companyName').value,
        logo: logoData
      },
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
      notes: document.getElementById('notes').value,
      template: selectedTemplate,
      currency: document.getElementById('currency').value
    };
    
    try {
      // Determine endpoint based on format
      const endpoint = exportFormat === 'pdf' ? '/api/invoices/pdf' : '/api/invoices/json';
      
      // Send the data to the API
      const response = await fetch(endpoint, {
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
      
      if (exportFormat === 'pdf') {
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
      } else {
        // Handle JSON response
        const jsonData = await response.json();
        
        // Convert to a downloadable file
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], {type: 'application/json'});
        const url = window.URL.createObjectURL(jsonBlob);
        
        // Create a link to download the JSON
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceData.invoice.invoiceNumber}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      hideLoading();
      showSuccessMessage(invoiceData.invoice.invoiceNumber);
      
    } catch (error) {
      hideLoading();
      alert(`Error: ${error.message}`);
      console.error('Error generating invoice:', error);
    }
  }
  
  // Call updateSubtotal initially to set up the display
  updateSubtotal();
}); 