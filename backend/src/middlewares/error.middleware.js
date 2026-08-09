exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma specific errors if needed
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A unique constraint failed on the database.' });
    }
  }

  res.status(500).json({ error: 'Internal Server Error' });
};
