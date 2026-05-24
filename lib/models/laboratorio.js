'use strict';
module.exports = (sequelize, DataTypes) => {
  const Laboratorio = sequelize.define(
    'Laboratorio',
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,

        validate: {
          notEmpty: true,
        },
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,

        validate: {
          min: 1,
        },
      },
      edificio: {
        type: DataTypes.STRING,
        allowNull: false,

        validate: {
          notEmpty: true,
        },
      },
    },
    {
      // Esto es importante para que Sequelize sepa que la tabla
      // se llama exactamente "Laboratorios" (como la pusimos en la migración)
      tableName: 'Laboratorios',
      timestamps: true,
    }
  );

  Laboratorio.associate = (models) => {
    Laboratorio.hasMany(models.Pedido, {
      foreignKey: 'laboratorioId',
    });
  };

  return Laboratorio;
};
