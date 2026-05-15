'use strict';
module.exports = (sequelize, DataTypes) => {
  const PedidoReactivo = sequelize.define(
    'PedidoReactivo',
    {
      pedidoId: DataTypes.INTEGER,
      reagentId: DataTypes.INTEGER,
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
    },
    { tableName: 'PedidoReactivos' }
  );
  return PedidoReactivo;
};
