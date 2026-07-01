import db from '../../models';
import { broadcast } from '../../websocket';

const { Carrito, CarritoItem, Pedido } = db;

export const getAll = async (req, res) => {
  const carritos = await Carrito.findAll({
    include: [
      {
        model: CarritoItem,
        as: 'items',
      },
      {
        model: Pedido,
        attributes: [
          'id',
          'fecha',
          'horaInicio',
          'horaFin',
          'laboratorioId',
          'estado',
        ],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json({ data: carritos.map((c) => c.toJSON()) });
};

export const getByPedidoId = async (req, res) => {
  const carritos = await Carrito.findAll({
    where: { pedidoId: req.params.pedidoId },
    include: [{ model: CarritoItem, as: 'items' }],
  });
  res.json({ data: carritos.map((c) => c.toJSON()) });
};

export const marcarPreparado = async (req, res) => {
  const carrito = await Carrito.findByPk(req.params.id);
  if (!carrito) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }
  carrito.preparado = !carrito.preparado;
  await carrito.save();
  const updated = await Carrito.findByPk(carrito.id, {
    include: [{ model: CarritoItem, as: 'items' }],
  });
  res.json({ data: updated.toJSON() });
  broadcast('CARRITO_ACTUALIZADO', updated.toJSON());
};

export const remove = async (req, res) => {
  const carrito = await Carrito.findByPk(req.params.id, {
    include: [{ model: Pedido }],
  });
  if (!carrito)
    return res.status(404).json({ message: 'Carrito no encontrado' });

  // Limpiar datos de despensa del pedido asociado
  if (carrito.Pedido?.descripcion) {
    const desc = carrito.Pedido.descripcion;
    const cleaned = desc.replace(/\n?__DESPENSA__:\{.+\}/, '').trim();
    if (cleaned !== desc) {
      await carrito.Pedido.update({
        descripcion: cleaned || '(sin descripción)',
      });
    }
  }

  await CarritoItem.destroy({ where: { carritoId: carrito.id } });
  await carrito.destroy();
  res.status(204).send();
  broadcast('CARRITO_ACTUALIZADO', { carritoId: req.params.id });
};

export const toggleItemPreparado = async (req, res) => {
  const item = await CarritoItem.findByPk(req.params.itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item no encontrado' });
  }
  item.preparado = !item.preparado;
  await item.save();
  const carrito = await Carrito.findByPk(item.carritoId, {
    include: [{ model: CarritoItem, as: 'items' }],
  });
  res.json({ data: carrito.toJSON() });
  broadcast('CARRITO_ACTUALIZADO', carrito.toJSON());
};
