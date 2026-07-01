import { Model, DataTypes } from 'sequelize';

export default class PedidoRevision extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: { type: DataTypes.INTEGER, allowNull: false },
        usuarioId: { type: DataTypes.INTEGER, allowNull: false },
        comentario: { type: DataTypes.TEXT, allowNull: true },
        cambios: { type: DataTypes.JSON, allowNull: true },
        estado: {
          type: DataTypes.ENUM(
            'pendiente',
            'aceptada',
            'rechazada',
            'respuesta',
            'mensaje'
          ),
          defaultValue: 'pendiente',
        },
      },
      {
        sequelize,
        modelName: 'PedidoRevision',
        tableName: 'PedidoRevisiones',
      }
    );
  }

  static associate(models) {
    PedidoRevision.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
    PedidoRevision.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
  }
}
