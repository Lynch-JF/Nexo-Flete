const { query, withTransaction } = require('../config/db');

// Acepta entityKeyColumns (array, como usan las rutas) o entityKeyColumn (string),
// y un `compute(body)` opcional que devuelve columnas calculadas por el servidor.
function createVersionedController({ table, entityKeyColumns, entityKeyColumn, insertColumns, compute }) {
  const keys = entityKeyColumns || [entityKeyColumn];

  async function listVigentes(req, res) {
    try {
      res.json((await query(`SELECT * FROM ${table} WHERE vigente_hasta IS NULL ORDER BY id`)).rows);
    } catch (err) {
      console.error(`Error listando vigentes de ${table}:`, err);
      res.status(500).json({ error: 'Error al consultar el catálogo' });
    }
  }

  async function listHistorial(req, res) {
    try {
      res.json((await query(`SELECT * FROM ${table} ORDER BY ${keys.join(', ')}, vigente_desde DESC`)).rows);
    } catch (err) {
      console.error(`Error listando historial de ${table}:`, err);
      res.status(500).json({ error: 'Error al consultar el historial' });
    }
  }

  async function create(req, res) {
    const missing = insertColumns.filter((c) => req.body[c] === undefined);
    if (missing.length) return res.status(400).json({ error: `Faltan campos: ${missing.join(', ')}` });

    const extra = compute ? compute(req.body) : {};
    const cols = [...insertColumns, ...Object.keys(extra)];
    const vals = [...insertColumns.map((c) => req.body[c]), ...Object.values(extra)];

    try {
      const nuevo = await withTransaction(async (client) => {
        // IS NOT DISTINCT FROM permite que zona_id = NULL identifique "todas las zonas"
        await client.query(
          `UPDATE ${table} SET vigente_hasta = CURRENT_DATE
            WHERE ${keys.map((k, i) => `${k} IS NOT DISTINCT FROM $${i + 1}`).join(' AND ')}
              AND vigente_hasta IS NULL`,
          keys.map((k) => req.body[k] ?? null)
        );
        const ins = await client.query(
          `INSERT INTO ${table} (${cols.join(', ')}, vigente_desde)
           VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}, CURRENT_DATE) RETURNING *`,
          vals
        );
        return ins.rows[0];
      });
      res.status(201).json(nuevo);
    } catch (err) {
      console.error(`Error creando vigencia en ${table}:`, err);
      res.status(500).json({ error: 'Error al crear el registro' });
    }
  }

  return { listVigentes, listHistorial, create };
}

module.exports = { createVersionedController };
