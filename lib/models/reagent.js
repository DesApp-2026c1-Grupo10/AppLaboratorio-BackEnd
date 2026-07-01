import { Model, DataTypes } from 'sequelize';

export default class Reagent extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.STRING, allowNull: true },
        stock: { type: DataTypes.INTEGER, defaultValue: 0 },
        stockComprometido: { type: DataTypes.INTEGER, defaultValue: 0 },
        stockMinimo: { type: DataTypes.INTEGER, defaultValue: 0 },
        unidadMedida: { type: DataTypes.STRING, allowNull: true },
        vencimiento: { type: DataTypes.DATEONLY, allowNull: true },
        prep_time: { type: DataTypes.INTEGER, defaultValue: 0 },
        laboratorioId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Reagent',
        tableName: 'Reagents',
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
      through: models.PedidoReactivo,
      foreignKey: 'reagentId',
      otherKey: 'pedidoId',
      as: 'pedidos',
    });
    this.hasMany(models.MovimientoStock, {
      foreignKey: 'reactivoId',
      as: 'movimientos',
    });
    this.belongsToMany(models.SustanciaBasica, {
      through: models.ReactivoSustancia,
      foreignKey: 'reactivoId',
      otherKey: 'sustanciaBasicaId',
      as: 'composicion',
    });
  }
}
