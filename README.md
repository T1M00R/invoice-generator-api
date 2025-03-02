# Invoice Generator API

A simple yet powerful invoice generator that creates professional PDF invoices through a RESTful API with an easy-to-use web interface.

## Features

- Generate professional PDF invoices via API or web interface
- Customizable company and client information
- Company logo support
- Multiple invoice templates
- Support for multiple invoice items
- Tax calculation with custom descriptions
- Multiple currency support (USD, EUR, GBP, JPY, CAD, AUD)
- Live total calculation
- Export as PDF or JSON
- Responsive design
- Download generated invoices instantly

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - PDFKit for PDF generation
  - Joi for request validation

- **Frontend**:
  - HTML5
  - CSS3
  - Vanilla JavaScript

## Installation

1. Clone the repository:

git clone https://github.com/T1M00R/invoice-generator-api.git
cd invoice-generator-api

2. Install dependencies:

npm install

3. Create a `.env` file in the root directory (optional):

PORT=3000

4. Start the development server:

npm run dev

## Usage

### Web Interface

1. Open your browser and navigate to `http://localhost:3000`
2. Fill in your company information, including optional logo
3. Enter the client information, invoice details, and add items
4. Set tax rate if applicable
5. Choose an invoice template
6. Select your preferred currency
7. Choose export format (PDF or JSON)
8. Click "Generate Invoice" to create and download the file

### API Usage

To generate an invoice programmatically, send a POST request to `/api/invoices/pdf` or `/api/invoices/json` with the following JSON structure:

{
  "company": {
    "name": "Your Company Name",
    "logo": "base64EncodedLogoImage" // Optional
  },
  "client": {
    "name": "Client Name",
    "address": "123 Client Street, City, Country",
    "email": "client@example.com",
    "phone": "123-456-7890"
  },
  "invoice": {
    "invoiceNumber": "INV-12345",
    "date": "2023-06-01",
    "dueDate": "2023-07-01"
  },
  "items": [
    {
      "description": "Service Description",
      "quantity": 1,
      "unitPrice": 100.00
    }
  ],
  "tax": {
    "rate": 0.1,
    "description": "GST"
  },
  "notes": "Thank you for your business!",
  "template": "classic", // classic, modern, or minimal
  "currency": "USD" // USD, EUR, GBP, JPY, CAD, AUD
}

Example using cURL:

curl -X POST \
  http://localhost:3000/api/invoices/pdf \
  -H 'Content-Type: application/json' \
  -d '{
    "company": {
      "name": "Your Company Name"
    },
    "client": {
      "name": "Client Name",
      "address": "123 Client Street, City, Country",
      "email": "client@example.com",
      "phone": "123-456-7890"
    },
    "invoice": {
      "invoiceNumber": "INV-12345",
      "date": "2023-06-01",
      "dueDate": "2023-07-01"
    },
    "items": [
      {
        "description": "Service Description",
        "quantity": 1,
        "unitPrice": 100.00
      }
    ],
    "tax": {
      "rate": 0.1,
      "description": "GST"
    },
    "notes": "Thank you for your business!",
    "template": "classic",
    "currency": "USD"
  }'

## Project Structure

invoice-generator-api/
├── frontend/                      # Frontend files
│   ├── index.html                 # Main HTML file
│   ├── script.js                  # Frontend JavaScript
│   └── styles.css                 # CSS styles
├── src/                           # Backend source code
│   ├── app.js                     # Express application
│   ├── controllers/               # Route controllers
│   │   └── invoiceController.js
│   ├── middleware/                # Express middleware
│   │   └── validator.js
│   ├── routes/                    # API routes
│   │   └── invoiceRoutes.js
│   ├── services/                  # Business logic
│   │   └── pdfGenerator.js
│   └── utils/                     # Utility functions
│       └── errorHandler.js
├── .gitignore                     # Git ignore file
├── package.json                   # NPM package config
└── README.md                      # This file

## API Documentation

### Generate PDF Invoice

**Endpoint:** `POST /api/invoices/pdf`

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
| company | Object | Your company information |
| company.name | String | Company name |
| company.logo | String | Base64 encoded logo (optional) |
| client | Object | Client information |
| client.name | String | Client name |
| client.address | String | Client address |
| client.email | String | Client email |
| client.phone | String | Client phone (optional) |
| invoice | Object | Invoice details |
| invoice.invoiceNumber | String | Invoice number |
| invoice.date | String (ISO date) | Invoice date |
| invoice.dueDate | String (ISO date) | Due date |
| items | Array | Array of invoice items |
| items[].description | String | Item description |
| items[].quantity | Number | Item quantity |
| items[].unitPrice | Number | Price per unit |
| tax | Object | Tax information (optional) |
| tax.rate | Number | Tax rate (0 to 1) |
| tax.description | String | Tax description |
| notes | String | Additional notes (optional) |
| template | String | PDF template (classic, modern, minimal) |
| currency | String | Currency code (USD, EUR, GBP, JPY, CAD, AUD) |

**Response:**

A PDF file with the generated invoice.

### Generate JSON Invoice

**Endpoint:** `POST /api/invoices/json`

**Content-Type:** `application/json`

**Request Body:**

Same as for the PDF endpoint.

**Response:**

A JSON file with the invoice data including calculated totals.

## Future Enhancements

- Save invoices to database
- User accounts and authentication
- Recurring invoices
- Email delivery
- Payment integration
- Advanced tax handling
- Invoice tracking and status updates
- Additional currency support

## License

ISC

## Acknowledgements

- PDFKit for PDF generation
- Express.js for the API framework
- All contributors who help improve this project
