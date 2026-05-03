'use strict';

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(`
      SELECT id FROM roles WHERE name = 'TECHNICIAN' LIMIT 1
    `);

    const techRoleId = roles?.[0]?.id;
    if (!techRoleId) {
      throw new Error('TECHNICIAN role not found');
    }

    await queryInterface.sequelize.query(`
      UPDATE technicians
      SET role_id = ${Number(techRoleId)}
      WHERE role_id IS NULL
    `);
  },

  async down() {
    // no rollback needed for role backfill
  },
};