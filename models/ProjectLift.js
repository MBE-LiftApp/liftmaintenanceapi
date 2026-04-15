module.exports = (sequelize, DataTypes) => {
  const ProjectLift = sequelize.define(
    "ProjectLift",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      project_id: { type: DataTypes.BIGINT, allowNull: false },

      liftId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: "lift_id",
      },

      lift_code: { type: DataTypes.TEXT, allowNull: false },
      location_label: { type: DataTypes.TEXT, allowNull: true },

      passenger_capacity: { type: DataTypes.INTEGER, allowNull: true },
      lift_type: { type: DataTypes.TEXT, allowNull: true },
      number_of_floors: { type: DataTypes.INTEGER, allowNull: true },

      installation_start_date: { type: DataTypes.DATEONLY, allowNull: true },
      installation_end_date: { type: DataTypes.DATEONLY, allowNull: true },

      testing_start_date: { type: DataTypes.DATEONLY, allowNull: true },
      testing_end_date: { type: DataTypes.DATEONLY, allowNull: true },

      handover_date: { type: DataTypes.DATEONLY, allowNull: true },
      handover_actual_date: { type: DataTypes.DATEONLY, allowNull: true },

      warranty_months: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 12,
      },

      warranty_start_date: { type: DataTypes.DATEONLY, allowNull: true },
      warranty_end_date: { type: DataTypes.DATEONLY, allowNull: true },

      warrantyServiceVisits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        field: "warranty_service_visits",
      },

      notes: { type: DataTypes.TEXT, allowNull: true },

      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "project_lifts",
      timestamps: false,
    }
  );

  ProjectLift.associate = (models) => {
    ProjectLift.belongsTo(models.Project, { foreignKey: "project_id" });

    ProjectLift.belongsTo(models.Lift, {
      foreignKey: "liftId",
      targetKey: "id",
    });

    ProjectLift.hasMany(models.ProjectLiftAssignment, {
      foreignKey: "project_lift_id",
      as: "assignments",
    });
  };

  return ProjectLift;
};