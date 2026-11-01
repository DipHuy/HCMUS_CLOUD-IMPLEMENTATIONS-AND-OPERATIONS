const { PrismaClient } = require("@prisma/client");
const dbclient = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});
module.exports = { dbclient };
