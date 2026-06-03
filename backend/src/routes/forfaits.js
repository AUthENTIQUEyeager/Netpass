const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');

const prisma = new PrismaClient();

// GET /api/forfaits — public
router.get('/', async (req, res) => {
  try {
    const forfaits = await prisma.forfait.findMany({
      where: { actif: true },
      orderBy: { prix: 'asc' }
    });
    res.json(forfaits);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/forfaits/all — admin (inclut inactifs)
router.get('/all', auth, async (req, res) => {
  try {
    const forfaits = await prisma.forfait.findMany({ orderBy: { prix: 'asc' } });
    res.json(forfaits);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/forfaits — admin
router.post('/', auth, async (req, res) => {
  try {
    const { nom, prix, duree_heures, vitesse, description, wave_link } = req.body;
    const forfait = await prisma.forfait.create({
      data: { nom, prix: parseInt(prix), duree_heures: parseInt(duree_heures), vitesse, description, wave_link: wave_link || null }
    });
    res.json(forfait);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/forfaits/:id — admin
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, prix, duree_heures, vitesse, description, wave_link, actif } = req.body;
    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (prix !== undefined) data.prix = parseInt(prix);
    if (duree_heures !== undefined) data.duree_heures = parseInt(duree_heures);
    if (vitesse !== undefined) data.vitesse = vitesse;
    if (description !== undefined) data.description = description;
    if (wave_link !== undefined) data.wave_link = wave_link || null;
    if (actif !== undefined) data.actif = actif;
    const forfait = await prisma.forfait.update({ where: { id: req.params.id }, data });
    res.json(forfait);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/forfaits/:id — admin (désactive)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.forfait.update({ where: { id: req.params.id }, data: { actif: false } });
    res.json({ message: 'Forfait désactivé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
