import { Model, DataTypes } from 'sequelize';

export default class CarritoItem extends Model {
  static init(sequelize) {
    return super.init(
      {
        carritoId: { type: DataTypes.INTEGER, allowNull: false },
        tipo: { type: DataTypes.STRING, allowNull: false },
        itemId: { type: DataTypes.INTEGER, allowNull: false },
        nombre: { type: DataTypes.STRING, allowNull: false },
        cantidad: { type: DataTypes.INTEGER, allowNull: false },
        preparado: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        modelName: 'CarritoItem',
        tableName: 'CarritoItems',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Carrito, {
      foreignKey: 'carritoId',
      as: 'carrito',
    });
  }
}
