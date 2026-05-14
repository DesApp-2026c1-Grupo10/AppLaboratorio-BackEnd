module.exports = (sequelize, DataTypes) => {
  const Inventario = sequelize.define("Inventario", {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Inventario.associate = (models) => {
    Inventario.belongsTo(models.Laboratorio, {
      foreignKey: "laboratorioId",
    });
  };

  return Inventario;
};


