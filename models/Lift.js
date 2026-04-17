module.exports = (sequelize, DataTypes) => {
  const Lift = sequelize.define(
    'Lift',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      liftCode: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'liftCode',
      },

      building: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'building',
      },

      location: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'location',
      },

      customerName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'customerName',
      },

      status: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'status',
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'createdAt',
        defaultValue: DataTypes.NOW,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updatedAt',
        defaultValue: DataTypes.NOW,
      },

      liftPosition: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue('location');
        },
        set(value) {
          this.setDataValue('location', value);
        },
      },
    },
    {
      tableName: 'Lifts',
      timestamps: false,
    }
  );

  Lift.associate = (models) => {
    Lift.hasMany(models.ProjectLift, {
      foreignKey: 'liftId',
      sourceKey: 'id',
    });

    if (models.ServiceLog) {
      Lift.hasMany(models.ServiceLog, {
        foreignKey: 'liftId',
        sourceKey: 'id',
      });
    }
  };

  return Lift;
};