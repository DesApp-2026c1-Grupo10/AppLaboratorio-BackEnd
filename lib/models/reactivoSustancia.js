import { Model, DataTypes } from 'sequelize';

export default class ReactivoSustancia extends Model {
  static init(sequelize) {
    return super.init(
      {
        reactivoId: { type: DataTypes.INTEGER, allowNull: false },
        sustanciaBasicaId: { type: DataTypes.INTEGER, allowNull: false },
        porcentaje: { type: DataTypes.DOUBLE, allowNull: false },
      },
      {
        sequelize,
        modelName: 'ReactivoSustancia',
        tableName: 'ReactivoSustancias',
      }
    );
  }

  static associate(_models) {}
}
