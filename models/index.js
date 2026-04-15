const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

function buildDbConfig() {
  // Supports Heroku/Render style DATABASE_URL automatically.
  if (process.env.DATABASE_URL) {
    return {
      url: process.env.DATABASE_URL,
      options: {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      },
    };
  }

  return {
    url: null,
    options: {
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      logging: false,
      dialectOptions:
        String(process.env.DB_SSL || '').toLowerCase() === 'true'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    },
  };
}

const { url, options } = buildDbConfig();
const sequelize = url ? new Sequelize(url, options) : new Sequelize(options);

// Model factories
const CustomerFactory = require('./Customer');
const SiteFactory = require('./Site');
const LiftFactory = require('./Lift');
const ContractFactory = require('./Contract');
const ServiceLogFactory = require('./ServiceLog');
const TechnicianFactory = require('./Technician');
const TechnicianSessionFactory = require('./TechnicianSession');
const ProjectFactory = require('./Project');
const ProjectLiftFactory = require('./ProjectLift');
const ProjectLiftAssignmentFactory = require('./ProjectLiftAssignment');
const JobFactory = require("./Job");
const JobAssignmentFactory = require("./JobAssignment");

const models = {};
models.Customer = CustomerFactory(sequelize, DataTypes);
models.Site = SiteFactory(sequelize, DataTypes);
models.Lift = LiftFactory(sequelize, DataTypes);
models.Contract = ContractFactory(sequelize, DataTypes);
models.ServiceLog = ServiceLogFactory(sequelize, DataTypes);
models.Technician = TechnicianFactory(sequelize, DataTypes);
models.TechnicianSession = TechnicianSessionFactory(sequelize, DataTypes);
models.Project = ProjectFactory(sequelize, DataTypes);
models.ProjectLift = ProjectLiftFactory(sequelize, DataTypes);
models.ProjectLiftAssignment = ProjectLiftAssignmentFactory(sequelize, DataTypes);
models.Job = JobFactory(sequelize, DataTypes);
models.JobAssignment = JobAssignmentFactory(sequelize, DataTypes);

// Associations
Object.values(models).forEach((m) => {
  if (typeof m.associate === 'function') m.associate(models);
});

module.exports = {
  sequelize,
  ...models,
};
