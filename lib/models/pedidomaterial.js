import { Model, DataTypes } from 'sequelize';

export default class PedidoMaterial extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        materialId: { type: DataTypes.INTEGER, allowNull: false },
        cantidad: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        modelName: 'PedidoMaterial',
        tableName: 'PedidoMaterials',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
    this.belongsTo(models.Material, { foreignKey: 'materialId' });
  }
}
