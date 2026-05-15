'use strict';
module.exports = (sequelize, DataTypes) => {
  const PedidoMaterial = sequelize.define(
    'PedidoMaterial',
    {
      pedidoId: DataTypes.INTEGER,
      materialId: DataTypes.INTEGER,
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
    },
    { tableName: 'PedidoMateriales' }
  );
  return PedidoMaterial;
};
