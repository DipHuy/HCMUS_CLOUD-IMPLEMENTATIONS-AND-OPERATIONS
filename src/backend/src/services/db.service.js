const { PrismaClient } = require("@prisma/client");
const writer = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_WRITER_URL } },
});
const reader = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_READER_URL } },
});
module.exports = { writer, reader };
