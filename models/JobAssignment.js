module.exports = (sequelize, DataTypes) => {
  const JobAssignment = sequelize.define(
    "JobAssignment",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      job_id: { type: DataTypes.BIGINT, allowNull: false },
      technician_id: { type: DataTypes.BIGINT, allowNull: false },

      assignment_role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "TECH",
      },

      assigned_at: { type: DataTypes.DATE, allowNull: false },
      unassigned_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "job_assignments",
      timestamps: false,
    }
  );

  JobAssignment.associate = (models) => {
    JobAssignment.belongsTo(models.Job, { foreignKey: "job_id" });
    JobAssignment.belongsTo(models.Technician, { foreignKey: "technician_id" });
  };

  return JobAssignment;
};