const { Sequelize, DataTypes } = require("sequelize");

function buildLocalUrl() {
  // Force IPv4 to avoid localhost/IPv6 edge cases
  const host = process.env.DB_HOST && process.env.DB_HOST.trim()
    ? process.env.DB_HOST.trim()
    : "127.0.0.1";

  const port = process.env.DB_PORT && process.env.DB_PORT.trim()
    ? process.env.DB_PORT.trim()
    : "5432";

  const name = process.env.DB_NAME && process.env.DB_NAME.trim()
    ? process.env.DB_NAME.trim()
    : "LiftMaintenanceDB";

  const user = process.env.DB_USER && process.env.DB_USER.trim()
    ? process.env.DB_USER.trim()
    : "postgres";

  const pass = process.env.DB_PASS ?? "";

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${name}`;
}

const isHeroku = !!process.env.DATABASE_URL;
const url = isHeroku ? process.env.DATABASE_URL : buildLocalUrl();

const sequelize = new Sequelize(url, {
  logging: false,
  dialectOptions: isHeroku
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = { sequelize, DataTypes };
