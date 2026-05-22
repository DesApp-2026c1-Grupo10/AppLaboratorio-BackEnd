import { Model, DataTypes } from 'sequelize';

export default class UsoEquipo extends Model {
  static init(sequelize) {
    return super.init(
      {
        equipoId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        pedidoId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        fechaInicio: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        fechaFin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        observaciones: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'UsoEquipo',
        tableName: 'UsosEquipo',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Equipment, {
      foreignKey: 'equipoId',
      as: 'equipo',
    });
    this.belongsTo(models.Pedido, {
      foreignKey: 'pedidoId',
      as: 'pedido',
    });
  }
}
