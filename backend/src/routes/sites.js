const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');

const prisma = new PrismaClient();

// GET /api/sites — public
router.get('/', async (req, res) => {
  try {
    const sites = await prisma.site.findMany({ where: { actif: true }, orderBy: { nom: 'asc' } });
    res.json(sites);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/sites/all — admin
router.get('/all', auth, async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            vouchers: { where: { statut: 'disponible' } },
            commandes: true
          }
        }
      }
    });
    res.json(sites);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/sites — admin
router.post('/', auth, async (req, res) => {
  try {
    const { nom, ville } = req.body;
    const site = await prisma.site.create({ data: { nom, ville } });
    res.json(site);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/sites/:id — admin
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, ville, actif } = req.body;
    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (ville !== undefined) data.ville = ville;
    if (actif !== undefined) data.actif = actif;
    const site = await prisma.site.update({ where: { id: req.params.id }, data });
    res.json(site);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/sites/:id — admin
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.site.update({ where: { id: req.params.id }, data: { actif: false } });
    res.json({ message: 'Site désactivé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
