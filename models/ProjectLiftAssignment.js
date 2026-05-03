module.exports = (sequelize, DataTypes) => {
  const ProjectLiftAssignment = sequelize.define(
    'ProjectLiftAssignment',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      project_lift_id: { type: DataTypes.BIGINT, allowNull: false },
      technician_id: { type: DataTypes.BIGINT, allowNull: false },

      assignment_role: { type: DataTypes.TEXT, allowNull: false },

      status: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'ASSIGNED',
      },

      due_date: { type: DataTypes.DATEONLY, allowNull: true },

      assigned_at: { type: DataTypes.DATE, allowNull: true },
      started_at: { type: DataTypes.DATE, allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      unassigned_at: { type: DataTypes.DATE, allowNull: true },

      notes: { type: DataTypes.TEXT, allowNull: true },

      supervisor_status: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'PENDING',
      },
      supervisor_approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      supervisor_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

checklist_status: {
  type: DataTypes.TEXT,
  allowNull: true,
},

checklist_completion_percent: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

      // ✅ ADD THESE TWO
      supervisor_rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      resubmission_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'project_lift_assignments',
      timestamps: false,
    }
  );


  ProjectLiftAssignment.associate = (models) => {
    ProjectLiftAssignment.belongsTo(models.ProjectLift, {
      foreignKey: 'project_lift_id',
    });
    ProjectLiftAssignment.belongsTo(models.Technician, {
      foreignKey: 'technician_id',
    });
  };

  return ProjectLiftAssignment;
};