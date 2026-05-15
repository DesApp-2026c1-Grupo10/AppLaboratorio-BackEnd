'use strict';
module.exports = (sequelize, DataTypes) => {
  const PedidoEquipo = sequelize.define(
    'PedidoEquipo',
    {
      pedidoId: DataTypes.INTEGER,
      equipmentId: DataTypes.INTEGER,
    },
    { tableName: 'PedidoEquipos' }
  );
  return PedidoEquipo;
};
