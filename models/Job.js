module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define(
    "Job",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      job_type: { type: DataTypes.STRING(30), allowNull: false },
      source_type: { type: DataTypes.STRING(30), allowNull: false },

      project_id: { type: DataTypes.BIGINT, allowNull: true },
      project_lift_id: { type: DataTypes.BIGINT, allowNull: true },
      lift_id: { type: DataTypes.BIGINT, allowNull: true },

      title: { type: DataTypes.TEXT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },

      priority: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "NORMAL",
      },

      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "ASSIGNED",
      },

      due_date: { type: DataTypes.DATEONLY, allowNull: true },

      created_at: { type: DataTypes.DATE, allowNull: false },
      started_at: { type: DataTypes.DATE, allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      cancelled_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "jobs",
      timestamps: false,
    }
  );

  Job.associate = (models) => {
    Job.belongsTo(models.Project, { foreignKey: "project_id" });
    Job.belongsTo(models.ProjectLift, { foreignKey: "project_lift_id" });
    Job.belongsTo(models.Lift, { foreignKey: "lift_id" });

    Job.hasMany(models.JobAssignment, { foreignKey: "job_id" });
  };

  return Job;
};