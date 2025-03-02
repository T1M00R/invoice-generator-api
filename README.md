# Invoice Generator API

A simple yet powerful invoice generator that creates professional PDF invoices through a RESTful API with an easy-to-use web interface.

## Features

- Generate professional PDF invoices via API or web interface
- Customizable client information
- Support for multiple invoice items
- Tax calculation
- Live total calculation
- Responsive design
- Download generated invoices as PDF files

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
2. Fill in the client information, invoice details, and add items
3. Set tax rate if applicable
4. Click "Generate Invoice" to create and download the PDF

### API Usage

To generate an invoice programmatically, send a POST request to `/api/invoices` with the following JSON structure:

{
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
  "notes": "Thank you for your business!"
}

Example using cURL:

curl -X POST \
  http://localhost:3000/api/invoices \
  -H 'Content-Type: application/json' \
  -d '{
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
    "notes": "Thank you for your business!"
  }'

## Project Structure

invoice-generator-api/
├── frontend/               # Frontend files
│   ├── index.html         # Main HTML file
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # CSS styles
├── src/                    # Backend source code
│   ├── app.js             # Express application
│   ├── controllers/       # Route controllers
│   │   └── invoiceController.js
│   ├── middleware/        # Express middleware
│   │   └── validator.js
│   ├── routes/            # API routes
│   │   └── invoiceRoutes.js
│   ├── services/          # Business logic
│   │   └── pdfGenerator.js
│   └── utils/             # Utility functions
│       └── errorHandler.js
├── .gitignore             # Git ignore file
├── package.json           # NPM package config
└── README.md              # This file

## API Documentation

### Generate Invoice

**Endpoint:** `POST /api/invoices`

**Content-Type:** `application/json`

**Request Body:**

| Field | Type | Description |
|-------|------|-------------|
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

**Response:**

A PDF file with the generated invoice.

## Future Enhancements

- Multiple invoice templates
- Save invoices to database
- User accounts and authentication
- Recurring invoices
- Email delivery
- Payment integration
- Support for multiple currencies
- Advanced tax handling
- Invoice tracking and status updates

## License

ISC

## Acknowledgements

- PDFKit for PDF generation
- Express.js for the API framework
- All contributors who help improve this project
