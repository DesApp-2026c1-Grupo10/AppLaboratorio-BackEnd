import { Model, DataTypes } from 'sequelize';

export default class MovimientoStock extends Model {
  static init(sequelize) {
    return super.init(
      {
        tipoMovimiento: {
          type: DataTypes.ENUM(
            'entrada',
            'salida',
            'descarte',
            'compra',
            'producido',
            'usado'
          ),
          allowNull: false,
        },
        cantidad: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { min: 1 },
        },
        fecha: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        observacion: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        usuarioId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        materialId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        reactivoId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'MovimientoStock',
        tableName: 'MovimientosStock',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario',
    });
    this.belongsTo(models.Material, {
      foreignKey: 'materialId',
      as: 'material',
    });
    this.belongsTo(models.Reagent, {
      foreignKey: 'reactivoId',
      as: 'reactivo',
    });
  }
}
