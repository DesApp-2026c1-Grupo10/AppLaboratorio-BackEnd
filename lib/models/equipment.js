import { Model, DataTypes } from 'sequelize';

export default class Equipment extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: DataTypes.STRING,
        bld_id: DataTypes.INTEGER,
        status: {
          type: DataTypes.STRING,
          defaultValue: 'AVAILABLE',
        },
        is_movable: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Equipment',
        tableName: 'Equipments',
      }
    );
  }

  static associate(models) {
    // Relación con Pedidos a través de la tabla intermedia
    this.belongsToMany(models.Pedido, {
      through: 'PedidoEquipos',
      foreignKey: 'equipmentId',
    });
  }
}
