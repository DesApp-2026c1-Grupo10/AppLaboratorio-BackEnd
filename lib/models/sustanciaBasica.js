import { Model, DataTypes } from 'sequelize';

export default class SustanciaBasica extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        descripcion: { type: DataTypes.STRING, allowNull: true },
        stock: { type: DataTypes.INTEGER, defaultValue: 0 },
        stockMinimo: { type: DataTypes.INTEGER, defaultValue: 0 },
        unidadMedida: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: 'SustanciaBasica',
        tableName: 'SustanciasBasicas',
      }
    );
  }

  static associate(_models) {
    // Futuras asociaciones: recetas, etc.
  }
}
