import { Model, DataTypes } from 'sequelize';

export default class Equipment extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.STRING, allowNull: true },
        bld_id: { type: DataTypes.INTEGER, allowNull: true },
        status: {
          type: DataTypes.STRING,
          defaultValue: 'Disponible',
          validate: {
            isIn: [
              [
                'Disponible',
                'En uso',
                'Mantenimiento',
                'Fuera de servicio',
                'Roto',
              ],
            ],
          },
        },
        is_movable: { type: DataTypes.BOOLEAN, defaultValue: false },
        laboratorioId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        ultimaRevision: { type: DataTypes.DATEONLY, allowNull: true },
        observaciones: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        modelName: 'Equipment',
        tableName: 'Equipments',
        paranoid: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Laboratorio, {
      foreignKey: 'laboratorioId',
      as: 'laboratorio',
    });
    this.belongsToMany(models.Pedido, {
      through: models.PedidoEquipo,
      foreignKey: 'equipmentId',
      otherKey: 'pedidoId',
    });
    this.hasMany(models.UsoEquipo, {
      foreignKey: 'equipoId',
      as: 'usos',
    });
  }
}
