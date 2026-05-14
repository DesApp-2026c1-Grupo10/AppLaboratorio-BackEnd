const { Pedido } = require("../models");
const { Op } = require("sequelize");

exports.validarDisponibilidad = async ({
  fecha,
  horaInicio,
  horaFin,
  laboratorioId,
}) => {

  const conflicto = await Pedido.findOne({
    where: {
      fecha,
      laboratorioId,

      estado: {
        [Op.ne]: "Rechazado",
      },

      [Op.or]: [
        {
          horaInicio: {
            [Op.lt]: horaFin,
          },

          horaFin: {
            [Op.gt]: horaInicio,
          },
        },
      ],
    },
  });

  return !conflicto;
};