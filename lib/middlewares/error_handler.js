export default function errorHandler(err, _req, res, _next) {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
}
