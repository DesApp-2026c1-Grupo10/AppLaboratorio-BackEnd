import { Model, DataTypes } from 'sequelize';

export default class PedidoReactivo extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        reagentId: { type: DataTypes.INTEGER, allowNull: false },
        cantidad: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        modelName: 'PedidoReactivo',
        tableName: 'PedidoReactivos',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
    this.belongsTo(models.Reagent, { foreignKey: 'reagentId' });
  }
}
