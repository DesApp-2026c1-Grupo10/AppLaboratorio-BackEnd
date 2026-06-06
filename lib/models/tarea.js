import { Model, DataTypes } from 'sequelize';

export default class Tarea extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        descripcion: { type: DataTypes.STRING, allowNull: false },
        completada: { type: DataTypes.BOOLEAN, defaultValue: false },
        tipo: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: 'Tarea',
        tableName: 'Tareas',
      }
    );
  }

  static associate(models) {
    Tarea.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
  }
}
