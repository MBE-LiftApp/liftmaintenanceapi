'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const [roles] = await queryInterface.sequelize.query(`
      SELECT id, name FROM roles
    `);

    const [permissions] = await queryInterface.sequelize.query(`
      SELECT id, code FROM permissions
    `);

    const roleMap = new Map(roles.map((r) => [r.name, Number(r.id)]));
    const permMap = new Map(permissions.map((p) => [p.code, Number(p.id)]));

    const supervisorCodes = [
      'dashboard.view',
      'projects.view',
      'lifts.view',
      'technicians.view',
      'contracts.view',
      'milestones.view',
      'milestones.create',
      'milestones.update',
      'jobs.view_all',
      'jobs.assign',
      'jobs.reassign',
      'jobs.approve',
      'reports.view_all',
      'reports.approve',
      'analytics.view',
    ];

    const managerCodes = [
      'dashboard.view',
      'projects.view',
      'lifts.view',
      'technicians.view',
      'contracts.view',
      'milestones.view',
      'jobs.view_all',
      'reports.view_all',
      'analytics.view',
    ];

    const technicianCodes = [
      'dashboard.view',
      'jobs.view_own',
      'jobs.update_own',
      'reports.create_own',
      'reports.update_own',
    ];

    const adminCodes = Array.from(permMap.keys());

    const rows = [];

    function addMappings(roleName, codes) {
      const roleId = roleMap.get(roleName);
      if (!roleId) return;

      for (const code of codes) {
        const permissionId = permMap.get(code);
        if (!permissionId) continue;

        rows.push({
          role_id: roleId,
          permission_id: permissionId,
          created_at: now,
          updated_at: now,
        });
      }
    }

    addMappings('ADMIN', adminCodes);
    addMappings('SUPERVISOR', supervisorCodes);
    addMappings('MANAGER', managerCodes);
    addMappings('TECHNICIAN', technicianCodes);

    await queryInterface.bulkInsert('role_permissions', rows, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  },
};