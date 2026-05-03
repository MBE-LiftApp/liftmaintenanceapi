require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    dialect: 'postgres',
    logging: false,
    dialectOptions: process.env.DATABASE_URL
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  },
};