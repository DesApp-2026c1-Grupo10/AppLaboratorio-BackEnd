import db from './lib/models/index.js';
const [tables] = await db.sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
console.log('Tables:', tables.map(t => t.table_name).join(', '));
const [meta] = await db.sequelize.query("SELECT * FROM \"SequelizeMeta\" ORDER BY name");
console.log('SequelizeMeta:', JSON.stringify(meta));
try {
  const [data] = await db.sequelize.query("SELECT * FROM \"SequelizeData\" ORDER BY name");
  console.log('SequelizeData:', JSON.stringify(data));
} catch(e) {
  console.log('No SequelizeData table');
}
// Check if migration 20260620000001-clean-historial was run
const [row] = await db.sequelize.query("SELECT COUNT(*) as cnt FROM \"ModificacionPedidos\"");
console.log('ModificacionPedidos count:', row[0].cnt);
process.exit(0);
