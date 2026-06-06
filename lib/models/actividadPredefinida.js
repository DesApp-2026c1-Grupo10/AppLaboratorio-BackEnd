import { Model, DataTypes } from 'sequelize';

export default class ActividadPredefinida extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: { type: DataTypes.STRING, allowNull: false },
        laboratorioId: { type: DataTypes.INTEGER, allowNull: false },
        horaInicio: { type: DataTypes.TIME, allowNull: false },
        horaFin: { type: DataTypes.TIME, allowNull: false },
        cantidadAlumnos: { type: DataTypes.INTEGER, allowNull: false },
        descripcion: { type: DataTypes.TEXT, allowNull: true },
        config: { type: DataTypes.JSONB, allowNull: true },
        usuarioId: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: 'ActividadPredefinida',
        tableName: 'ActividadesPredefinidas',
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    this.belongsTo(models.Laboratorio, { foreignKey: 'laboratorioId' });
  }
}
