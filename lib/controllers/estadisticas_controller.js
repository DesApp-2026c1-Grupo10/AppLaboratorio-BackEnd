import db from '../models';

export async function getResumen(req, res) {
  try {
    const pedidos = await db.Pedido.findAll({
      attributes: ['laboratorioId', 'estado', 'fecha', 'cantidadAlumnos'],
      include: [{ model: db.Laboratorio, attributes: ['nombre', 'edificio'] }],
    });

    const usosEquipo = await db.UsoEquipo.findAll({
      attributes: ['equipoId', 'createdAt'],
      include: [{ model: db.Equipment, as: 'equipo', attributes: ['name'] }],
    });

    const movimientos = await db.MovimientoStock.findAll({
      attributes: [
        'materialId',
        'reactivoId',
        'cantidad',
        'tipoMovimiento',
        'createdAt',
      ],
      include: [
        { model: db.Material, as: 'material', attributes: ['name'] },
        {
          model: db.Reagent,
          as: 'reactivo',
          attributes: ['name'],
          include: [
            {
              model: db.SustanciaBasica,
              as: 'composicion',
              through: { attributes: ['porcentaje'] },
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    const totalPedidos = pedidos.length;
    const pedidosPorEstado = pedidos.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});

    const laboratorioCount = pedidos.reduce((acc, p) => {
      const nombre = p.Laboratorio?.nombre || 'Sin laboratorio';
      if (!acc[nombre])
        acc[nombre] = { count: 0, alumnos: 0, id: p.laboratorioId };
      acc[nombre].count += 1;
      acc[nombre].alumnos += p.cantidadAlumnos || 0;
      return acc;
    }, {});

    const laboratoriosMasUsados = Object.entries(laboratorioCount)
      .map(([nombre, data]) => ({ nombre, ...data }))
      .sort((a, b) => b.count - a.count);

    const equipoCount = usosEquipo.reduce((acc, u) => {
      const nombre = u.equipo?.name || 'Desconocido';
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});
    const equiposMasUsados = Object.entries(equipoCount)
      .map(([nombre, usos]) => ({ nombre, usos }))
      .sort((a, b) => b.usos - a.usos);

    const materialCount = movimientos
      .filter((m) => m.tipoMovimiento === 'salida' && m.material)
      .reduce((acc, m) => {
        acc[m.material.name] = (acc[m.material.name] || 0) + m.cantidad;
        return acc;
      }, {});
    const materialesMasUsados = Object.entries(materialCount)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const reactivoNeto = movimientos
      .filter((m) => m.reactivo)
      .reduce((acc, m) => {
        const key = m.reactivo.name;
        if (!acc[key]) acc[key] = 0;
        acc[key] += m.tipoMovimiento === 'salida' ? m.cantidad : -m.cantidad;
        return acc;
      }, {});
    const reactivosMasUsados = Object.entries(reactivoNeto)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const sustanciaUsage = {};
    movimientos
      .filter(
        (m) => m.tipoMovimiento === 'salida' && m.reactivo?.composicion?.length
      )
      .forEach((m) => {
        m.reactivo.composicion.forEach((sust) => {
          const key = sust.name;
          const pct = sust.ReactivoSustancia.porcentaje;
          sustanciaUsage[key] =
            (sustanciaUsage[key] || 0) + m.cantidad * (pct / 100);
        });
      });

    const sustanciasMasUsadas = Object.entries(sustanciaUsage)
      .map(([nombre, cantidad]) => ({
        nombre,
        cantidad: Math.round(cantidad * 100) / 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const pedidosSemana = pedidos.filter(
      (p) => new Date(p.fecha) >= inicioSemana
    );
    const equiposSemana = usosEquipo.filter(
      (u) => new Date(u.createdAt) >= inicioSemana
    );
    const movimientosSemana = movimientos.filter(
      (m) => new Date(m.createdAt) >= inicioSemana
    );

    res.json({
      data: {
        resumen: {
          totalPedidos,
          pedidosPorEstado,
        },
        laboratoriosMasUsados,
        equiposMasUsados,
        materialesMasUsados,
        reactivosMasUsados,
        sustanciasMasUsadas,
        semanal: {
          pedidos: pedidosSemana.length,
          usosEquipo: equiposSemana.length,
          movimientos: movimientosSemana.length,
        },
      },
    });
  } catch (error) {
    console.error('Error en estadísticas:', error);
    res.status(500).json({ message: 'Error al generar estadísticas' });
  }
}
