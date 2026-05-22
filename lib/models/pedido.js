module.exports = (sequelize, DataTypes) => {
  const Pedido = sequelize.define('Pedido', {
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    horaInicio: { type: DataTypes.TIME, allowNull: false },
    horaFin: { type: DataTypes.TIME, allowNull: false },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado', 'Finalizado'),
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

    Pedido.belongsToMany(models.Equipment, {
      through: models.PedidoEquipo,
      foreignKey: 'pedidoId',
      otherKey: 'equipmentId',
    });

    Pedido.belongsToMany(models.Material, {
      through: models.PedidoMaterial,
      foreignKey: 'pedidoId',
      otherKey: 'materialId',
      as: 'materiales',
    });

    Pedido.belongsToMany(models.Reagent, {
      through: models.PedidoReactivo,
      foreignKey: 'pedidoId',
      otherKey: 'reagentId',
      as: 'reactivos',
    });
  };

  return Pedido;
};
