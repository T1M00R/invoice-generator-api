const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = { errorHandler }; 