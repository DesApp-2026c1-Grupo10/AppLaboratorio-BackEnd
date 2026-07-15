import { Model, DataTypes } from 'sequelize';

export default class PedidoEquipo extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        equipmentId: { type: DataTypes.INTEGER, allowNull: false },
        laboratorioIdOriginal: { type: DataTypes.INTEGER, allowNull: true },
      },
      {
        sequelize,
        modelName: 'PedidoEquipo',
        tableName: 'PedidoEquipos',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
    this.belongsTo(models.Equipment, { foreignKey: 'equipmentId' });
  }
}
