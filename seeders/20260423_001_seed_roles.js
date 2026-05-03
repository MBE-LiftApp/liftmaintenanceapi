'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('roles', [
      {
        name: 'ADMIN',
        description: 'Full system control',
        is_system_role: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'SUPERVISOR',
        description: 'Operational control without master creation rights',
        is_system_role: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'MANAGER',
        description: 'Read-only management access',
        is_system_role: true,
        created_at: now,
        updated_at: now,
      },
      {
        name: 'TECHNICIAN',
        description: 'Field execution user',
        is_system_role: true,
        created_at: now,
        updated_at: now,
      },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', {
      name: ['ADMIN', 'SUPERVISOR', 'MANAGER', 'TECHNICIAN'],
    }, {});
  },
};