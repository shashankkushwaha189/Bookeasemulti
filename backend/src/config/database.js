const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// Neon DB and production environments typically use a single connection string (DATABASE_URL) and require SSL.
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // Local Development with individual variables
  // Auto-detect if host is a Neon DB domain or SSL is explicitly requested
  const useSSL = process.env.DB_SSL === "true" || (process.env.DB_HOST && process.env.DB_HOST.includes("neon.tech"));

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
      dialectOptions: useSSL ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      } : {},
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    }
  );
}

module.exports = sequelize;