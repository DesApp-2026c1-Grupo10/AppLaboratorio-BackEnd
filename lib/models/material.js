import { Model, DataTypes } from 'sequelize';

export default class Material extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.STRING, allowNull: true },
        stock: { type: DataTypes.INTEGER, defaultValue: 0 },
        stockMinimo: { type: DataTypes.INTEGER, defaultValue: 0 },
        unit: { type: DataTypes.STRING, allowNull: true },
        laboratorioId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Material',
        tableName: 'Materials',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Laboratorio, {
      foreignKey: 'laboratorioId',
      as: 'laboratorio',
    });
    this.belongsToMany(models.Pedido, {
      through: models.PedidoMaterial,
      foreignKey: 'materialId',
      otherKey: 'pedidoId',
      as: 'pedidos',
    });
    this.hasMany(models.MovimientoStock, {
      foreignKey: 'materialId',
      as: 'movimientos',
    });
  }
}
