import { Model, DataTypes } from 'sequelize';

export default class Reagent extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: DataTypes.STRING,
        stock: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        prep_time: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'Reagent',
        tableName: 'Reagents',
      }
    );
  }

  static associate(models) {
    this.belongsToMany(models.Pedido, {
      through: 'PedidoReactivos',
      foreignKey: 'reagentId',
      as: 'pedidos',
    });
  }
}
