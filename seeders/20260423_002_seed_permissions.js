'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const rows = [
      ['dashboard.view', 'View Dashboard', 'dashboard', 'Can view dashboard summary'],

      ['projects.view', 'View Projects', 'projects', 'Can view projects'],
      ['projects.create', 'Create Projects', 'projects', 'Can create projects'],
      ['projects.update', 'Edit Projects', 'projects', 'Can edit projects'],
      ['projects.delete', 'Delete Projects', 'projects', 'Can delete projects'],

      ['lifts.view', 'View Lifts', 'lifts', 'Can view lifts'],
      ['lifts.create', 'Create Lifts', 'lifts', 'Can add lifts'],
      ['lifts.update', 'Edit Lifts', 'lifts', 'Can edit lifts'],
      ['lifts.delete', 'Delete Lifts', 'lifts', 'Can delete lifts'],

      ['technicians.view', 'View Technicians', 'technicians', 'Can view technicians'],
      ['technicians.create', 'Create Technicians', 'technicians', 'Can add technicians'],
      ['technicians.update', 'Edit Technicians', 'technicians', 'Can edit technicians'],
      ['technicians.delete', 'Delete Technicians', 'technicians', 'Can delete technicians'],

      ['contracts.view', 'View Contracts', 'contracts', 'Can view contracts'],
      ['contracts.amc_create', 'Create AMC', 'contracts', 'Can create AMC contracts'],
      ['contracts.update', 'Edit Contracts', 'contracts', 'Can edit contracts'],
      ['contracts.delete', 'Delete Contracts', 'contracts', 'Can delete contracts'],

      ['milestones.view', 'View Milestones', 'milestones', 'Can view milestones'],
      ['milestones.create', 'Create Milestones', 'milestones', 'Can enter milestones'],
      ['milestones.update', 'Edit Milestones', 'milestones', 'Can edit milestones'],
      ['milestones.approve', 'Approve Milestones', 'milestones', 'Can approve milestones'],

      ['jobs.view_own', 'View Own Jobs', 'jobs', 'Can view own jobs'],
      ['jobs.view_all', 'View All Jobs', 'jobs', 'Can view all jobs'],
      ['jobs.assign', 'Assign Jobs', 'jobs', 'Can assign jobs'],
      ['jobs.reassign', 'Reassign Jobs', 'jobs', 'Can reassign jobs'],
      ['jobs.update_own', 'Update Own Jobs', 'jobs', 'Can update assigned jobs'],
      ['jobs.approve', 'Approve Jobs', 'jobs', 'Can approve jobs'],

      ['reports.create_own', 'Create Own Reports', 'reports', 'Can create own reports'],
      ['reports.update_own', 'Update Own Reports', 'reports', 'Can update own reports'],
      ['reports.view_all', 'View All Reports', 'reports', 'Can view all reports'],
      ['reports.approve', 'Approve Reports', 'reports', 'Can approve reports'],

      ['analytics.view', 'View Analytics', 'analytics', 'Can view analytics'],
      ['settings.manage_roles', 'Manage Roles & Permissions', 'settings', 'Can manage roles and permissions'],
    ].map(([code, label, module, description]) => ({
      code,
      label,
      module,
      description,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert('permissions', rows, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};