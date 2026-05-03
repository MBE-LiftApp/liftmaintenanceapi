require('dotenv').config();

const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

async function run() {
  try {
    const name = 'Admin User';
    const email = 'admin@liftapp.com';
    const password = 'admin123';
    const role = 'ADMIN';

    await sequelize.authenticate();

    const existing = await User.findOne({
      where: { email },
    });

    if (existing) {
      console.log('User already exists:', email);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      isActive: true,
    });

    console.log('Admin user created successfully');
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    process.exit(0);
  } catch (e) {
    console.error('Failed to create admin user');
    console.error(e);
    process.exit(1);
  }
}

run();