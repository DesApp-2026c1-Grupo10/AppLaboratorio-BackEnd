'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ActividadesPredefinidas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      laboratorioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Laboratorios', key: 'id' },
        onDelete: 'CASCADE',
      },
      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horaFin: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      cantidadAlumnos: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      config: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('ActividadesPredefinidas');
  },
};
