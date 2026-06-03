const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');

const prisma = new PrismaClient();

// POST /api/auth/setup — Créer le premier admin (une seule fois)
router.post('/setup', async (req, res) => {
  try {
    const count = await prisma.admin.count();
    if (count > 0) return res.status(403).json({ error: 'Un admin existe déjà' });
    const { email, password, nom } = req.body;
    if (!email || !password || !nom) return res.status(400).json({ error: 'Champs manquants' });
    const hash = await bcrypt.hash(password, 12);
    const admin = await prisma.admin.create({ data: { email, password: hash, nom } });
    res.json({ message: 'Admin créé', email: admin.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, nom: admin.nom },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, admin: { id: admin.id, email: admin.email, nom: admin.nom } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.admin);
});

module.exports = router;
