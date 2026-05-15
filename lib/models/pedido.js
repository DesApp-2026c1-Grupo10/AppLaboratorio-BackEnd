module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    horaInicio: { type: DataTypes.TIME, allowNull: false },
    horaFin: { type: DataTypes.TIME, allowNull: false },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado'),
      defaultValue: 'Pendiente',
    },
    descripcion: { type: DataTypes.TEXT },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false },
    laboratorioId: { type: DataTypes.INTEGER, allowNull: false },
    cantidadAlumnos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
  });

  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    Pedido.belongsTo(models.Laboratorio, { foreignKey: 'laboratorioId' });

    // Relaciones para el inventario
    Pedido.belongsToMany(models.Equipment, {
      through: 'PedidoEquipos',
      foreignKey: 'pedidoId',
    });
    Pedido.belongsToMany(models.Material, {
      through: 'PedidoMateriales',
      foreignKey: 'pedidoId',
      as: 'materiales',
    });
    Pedido.belongsToMany(models.Reagent, {
      through: 'PedidoReactivos',
      foreignKey: 'pedidoId',
      as: 'reactivos',
    });
  };

  return Pedido;
};
