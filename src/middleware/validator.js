const Joi = require('joi');

const invoiceSchema = Joi.object({
  company: Joi.object({
    name: Joi.string().required(),
    logo: Joi.string().allow(null, '')
  }).required(),
  
  client: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
  }).required(),
  
  invoice: Joi.object({
    invoiceNumber: Joi.string().required(),
    date: Joi.date().iso().required(),
    dueDate: Joi.date().iso().required()
  }).required(),
  
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required()
    })
  ).min(1).required(),
  
  tax: Joi.object({
    rate: Joi.number().min(0).max(1),
    description: Joi.string()
  }),
  
  notes: Joi.string().allow(''),
  
  template: Joi.string().valid('classic', 'modern', 'minimal').default('classic'),
  
  currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD')
});

const validateInvoiceData = (req, res, next) => {
  const { error } = invoiceSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }
  
  next();
};

module.exports = { validateInvoiceData }; 