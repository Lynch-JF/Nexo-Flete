const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// GET /personal — activos con el nombre del rol (?incluirInactivos=1 trae todos)
router.get('/', requireAuth, async (req, res) => {
  try {
    const where = req.query.incluirInactivos ? '' : 'WHERE p.activo = true';
    const r = await query(
      `SELECT p.id, p.nombre, p.rol_laboral_id, p.activo, rl.rol
         FROM personal p LEFT JOIN roles_laborales rl ON rl.id = p.rol_laboral_id
         ${where} ORDER BY p.nombre`
    );
    res.json(r.rows);
  } catch (err) {
    console.error('Error listando personal:', err);
    res.status(500).json({ error: 'Error al consultar el personal' });
  }
});

// POST /personal
router.post('/', requireAuth, checkRole('admin_costeo'), async (req, res) => {
  const { nombre, rol_laboral_id } = req.body;
  if (!nombre || !rol_laboral_id) return res.status(400).json({ error: 'nombre y rol_laboral_id son requeridos' });
  try {
    const r = await query('INSERT INTO personal (nombre, rol_laboral_id) VALUES ($1, $2) RETURNING *', [nombre, rol_laboral_id]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Error creando personal:', err);
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
});

// PATCH /personal/:id — editar o activar/desactivar
router.patch('/:id', requireAuth, checkRole('admin_costeo'), async (req, res) => {
  const { nombre, rol_laboral_id, activo } = req.body;
  try {
    const r = await query(
      `UPDATE personal SET nombre = COALESCE($1, nombre), rol_laboral_id = COALESCE($2, rol_laboral_id),
              activo = COALESCE($3, activo) WHERE id = $4 RETURNING *`,
      [nombre ?? null, rol_laboral_id ?? null, activo ?? null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error('Error actualizando personal:', err);
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
});

module.exports = router;
