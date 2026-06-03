const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');

const prisma = new PrismaClient();

// GET /api/vouchers — admin, liste tous les vouchers
router.get('/', auth, async (req, res) => {
  try {
    const { site_id, forfait_id, statut, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (site_id) where.site_id = site_id;
    if (forfait_id) where.forfait_id = forfait_id;
    if (statut) where.statut = statut;

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        include: {
          site: { select: { nom: true, ville: true } },
          forfait: { select: { nom: true, duree_heures: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.voucher.count({ where })
    ]);

    res.json({ vouchers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/vouchers/stock — admin, résumé du stock par site/forfait
router.get('/stock', auth, async (req, res) => {
  try {
    const stock = await prisma.voucher.groupBy({
      by: ['site_id', 'forfait_id', 'statut'],
      _count: { id: true }
    });

    const sites = await prisma.site.findMany({ select: { id: true, nom: true, ville: true } });
    const forfaits = await prisma.forfait.findMany({ select: { id: true, nom: true, prix: true } });

    res.json({ stock, sites, forfaits });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/vouchers — admin, ajouter vouchers en stock (bulk)
router.post('/', auth, async (req, res) => {
  try {
    const { site_id, forfait_id, vouchers } = req.body;
    // vouchers = [{ username, password }, ...]
    if (!Array.isArray(vouchers) || vouchers.length === 0) {
      return res.status(400).json({ error: 'Liste de vouchers vide' });
    }
    if (vouchers.length > 500) {
      return res.status(400).json({ error: 'Maximum 500 vouchers à la fois' });
    }

    const data = vouchers.map(v => ({
      site_id,
      forfait_id,
      username: v.username.trim(),
      password: v.password.trim(),
      statut: 'disponible'
    }));

    const result = await prisma.voucher.createMany({ data, skipDuplicates: true });
    res.json({ message: `${result.count} vouchers ajoutés`, count: result.count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/vouchers/assigner — admin, assigner un voucher à une commande
router.post('/assigner', auth, async (req, res) => {
  try {
    const { commande_id, voucher_id } = req.body;

    const commande = await prisma.commande.findUnique({
      where: { id: commande_id },
      include: { forfait: true, ticket: true }
    });
    if (!commande) return res.status(404).json({ error: 'Commande introuvable' });
    if (commande.ticket) return res.status(400).json({ error: 'Un ticket est déjà assigné à cette commande' });

    const voucher = await prisma.voucher.findUnique({ where: { id: voucher_id } });
    if (!voucher) return res.status(404).json({ error: 'Voucher introuvable' });
    if (voucher.statut !== 'disponible') return res.status(400).json({ error: 'Ce voucher n\'est plus disponible' });

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + commande.forfait.duree_heures);

    const [ticket] = await prisma.$transaction([
      prisma.ticket.create({
        data: {
          commande_id,
          voucher_id,
          date_expiration: expiration
        }
      }),
      prisma.voucher.update({ where: { id: voucher_id }, data: { statut: 'assigné' } }),
      prisma.commande.update({ where: { id: commande_id }, data: { statut: 'ticket_assigné' } })
    ]);

    res.json({ message: 'Voucher assigné avec succès', ticket_id: ticket.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/vouchers/:id — admin, supprimer un voucher disponible
router.delete('/:id', auth, async (req, res) => {
  try {
    const v = await prisma.voucher.findUnique({ where: { id: req.params.id } });
    if (!v) return res.status(404).json({ error: 'Voucher introuvable' });
    if (v.statut !== 'disponible') return res.status(400).json({ error: 'Impossible de supprimer un voucher déjà utilisé' });
    await prisma.voucher.delete({ where: { id: req.params.id } });
    res.json({ message: 'Voucher supprimé' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
