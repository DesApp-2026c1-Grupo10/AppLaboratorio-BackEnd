import { Model, DataTypes } from 'sequelize';

export default class Carrito extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        preparado: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        modelName: 'Carrito',
        tableName: 'Carritos',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pedido, {
      foreignKey: 'pedidoId',
    });
    this.hasMany(models.CarritoItem, {
      foreignKey: 'carritoId',
      as: 'items',
    });
  }
}
