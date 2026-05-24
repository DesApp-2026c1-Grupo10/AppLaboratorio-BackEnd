import { Model, DataTypes } from 'sequelize';

export default class ModificacionPedido extends Model {
  static init(sequelize) {
    return super.init(
      {
        pedidoId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        usuarioId: DataTypes.INTEGER,
        tipo: {
          type: DataTypes.ENUM(
            'CREACION',
            'MODIFICACION',
            'APROBACION',
            'RECHAZO',
            'FINALIZACION'
          ),
          allowNull: false,
        },
        cambios: DataTypes.JSON, // { campo: { antes: valor1, despues: valor2 } }
        descripcion: DataTypes.TEXT,
      },
      {
        sequelize,
        modelName: 'ModificacionPedido',
        tableName: 'ModificacionPedidos',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Pedido, { foreignKey: 'pedidoId' });
    this.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
  }
}
