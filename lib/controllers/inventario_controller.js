import db from '../models';
const { Equipment, Material, Reagent } = db;
// === EQUIPMENT ===
export const getAllEquipos = async (req, res) => {
  const equipos = await Equipment.findAll();
  res.json({ data: equipos.map((eq) => eq.toJSON()) });
};
export const getEquipoById = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id);
  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }
  res.json({ data: equipo.toJSON() });
};
export const createEquipo = async (req, res) => {
  const equipo = await Equipment.create(req.body);
  res.status(201).json({ data: equipo.toJSON() });
};
export const updateEquipo = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id);
  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }
  await equipo.update(req.body);
  res.json({ data: equipo.toJSON() });
};
export const removeEquipo = async (req, res) => {
  const equipo = await Equipment.findByPk(req.params.id);
  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }
  await equipo.destroy();
  res.status(204).send();
};
// === MATERIAL ===
export const getAllMateriales = async (req, res) => {
  const materiales = await Material.findAll();
  res.json({ data: materiales.map((m) => m.toJSON()) });
};
export const getMaterialById = async (req, res) => {
  const material = await Material.findByPk(req.params.id);
  if (!material) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }
  res.json({ data: material.toJSON() });
};
export const createMaterial = async (req, res) => {
  const material = await Material.create(req.body);
  res.status(201).json({ data: material.toJSON() });
};
export const updateMaterial = async (req, res) => {
  const material = await Material.findByPk(req.params.id);
  if (!material) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }
  await material.update(req.body);
  res.json({ data: material.toJSON() });
};
export const removeMaterial = async (req, res) => {
  const material = await Material.findByPk(req.params.id);
  if (!material) {
    return res.status(404).json({ error: 'Material no encontrado' });
  }
  await material.destroy();
  res.status(204).send();
};
// === REAGENT ===
export const getAllReactivos = async (req, res) => {
  const reactivos = await Reagent.findAll();
  res.json({ data: reactivos.map((r) => r.toJSON()) });
};
export const getReactivoById = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id);
  if (!reactivo) {
    return res.status(404).json({ error: 'Reactivo no encontrado' });
  }
  res.json({ data: reactivo.toJSON() });
};
export const createReactivo = async (req, res) => {
  const reactivo = await Reagent.create(req.body);
  res.status(201).json({ data: reactivo.toJSON() });
};
export const updateReactivo = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id);
  if (!reactivo) {
    return res.status(404).json({ error: 'Reactivo no encontrado' });
  }
  await reactivo.update(req.body);
  res.json({ data: reactivo.toJSON() });
};
export const removeReactivo = async (req, res) => {
  const reactivo = await Reagent.findByPk(req.params.id);
  if (!reactivo) {
    return res.status(404).json({ error: 'Reactivo no encontrado' });
  }
  await reactivo.destroy();
  res.status(204).send();
};
