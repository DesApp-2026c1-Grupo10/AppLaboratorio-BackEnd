"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.createTable("Pedidos", {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      horaFin: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      estado: {
        type: Sequelize.ENUM(
          "Pendiente",
          "Aprobado",
          "Rechazado"
        ),

        defaultValue: "Pendiente",
      },

      descripcion: {
        type: Sequelize.TEXT,
      },

      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "Usuarios",
          key: "id",
        },

        onDelete: "CASCADE",
      },

      laboratorioId: {
        type: Sequelize.INTEGER,
        allowNull: false,

        references: {
          model: "Laboratorios",
          key: "id",
        },

        onDelete: "CASCADE",
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

  async down(queryInterface) {

    await queryInterface.dropTable("Pedidos");

  },
};