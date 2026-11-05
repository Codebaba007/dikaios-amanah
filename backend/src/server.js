require('dotenv').config();

const app = require('./app');

const prisma = app.prisma;

/**
 * Parse PORT defensively.
 *
 * Some shells here export PORT=0, which silently asks the OS for a random
 * port. Only accept a real, usable port number and otherwise fall back.
 */
const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT =
  Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort < 65536 ? parsedPort : 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server failed to start:', error.message);
  process.exitCode = 1;
});

async function shutdown(signal) {
  console.log(`${signal} received — closing server.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  // Do not hang forever waiting for keep-alive connections.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
