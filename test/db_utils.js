import db from '../lib/models';

const TRUNCATE_QUERY = `DO
$$
DECLARE
  l_stmt text;
BEGIN
  SELECT 'TRUNCATE ' || string_agg(format('%I.%I', schemaname, tablename), ',') || ' RESTART IDENTITY CASCADE'
    INTO l_stmt
  FROM pg_tables
  WHERE schemaname IN ('public') AND pg_tables.tablename NOT IN ('SequelizeMeta', 'SequelizeData');

  IF l_stmt IS NOT NULL THEN
    EXECUTE l_stmt;
  END IF;
END;
$$`;

export async function cleanDb() {
  await db.sequelize.query(TRUNCATE_QUERY);
}
