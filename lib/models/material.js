import { Model, DataTypes } from 'sequelize';

export default class Material extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: DataTypes.STRING,
        stock: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        unit: {
          type: DataTypes.STRING,
        },
      },
      {
        sequelize,
        modelName: 'Material',
        tableName: 'Materials', // Forzamos el nombre de la tabla de la migración
      }
    );
  }

  static associate(models) {
    this.belongsToMany(models.Pedido, {
      through: 'PedidoMateriales',
      foreignKey: 'materialId',
      as: 'pedidos',
    });
  }
}
