const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const debut_mois = new Date(now.getFullYear(), now.getMonth(), 1);
    const debut_semaine = new Date(now);
    debut_semaine.setDate(now.getDate() - 7);

    const [
      total_commandes,
      commandes_en_attente,
      commandes_mois,
      revenus_total,
      revenus_mois,
      stock_disponible,
      stock_assigne,
      total_sites,
      total_forfaits,
      commandes_7j
    ] = await Promise.all([
      prisma.commande.count(),
      prisma.commande.count({ where: { statut: 'en_attente' } }),
      prisma.commande.count({ where: { created_at: { gte: debut_mois } } }),
      prisma.commande.aggregate({ _sum: { montant: true }, where: { statut: 'ticket_assigné' } }),
      prisma.commande.aggregate({ _sum: { montant: true }, where: { statut: 'ticket_assigné', created_at: { gte: debut_mois } } }),
      prisma.voucher.count({ where: { statut: 'disponible' } }),
      prisma.voucher.count({ where: { statut: 'assigné' } }),
      prisma.site.count({ where: { actif: true } }),
      prisma.forfait.count({ where: { actif: true } }),
      prisma.commande.findMany({
        where: { created_at: { gte: debut_semaine } },
        select: { created_at: true, montant: true, statut: true },
        orderBy: { created_at: 'asc' }
      })
    ]);

    // Grouper par jour pour le graphique
    const graphData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayCommandes = commandes_7j.filter(c =>
        c.created_at.toISOString().split('T')[0] === dateStr
      );
      graphData.push({
        date: dateStr,
        label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        commandes: dayCommandes.length,
        revenus: dayCommandes.filter(c => c.statut === 'ticket_assigné').reduce((s, c) => s + c.montant, 0)
      });
    }

    // Top forfaits
    const top_forfaits = await prisma.commande.groupBy({
      by: ['forfait_id'],
      _count: { id: true },
      _sum: { montant: true },
      where: { statut: 'ticket_assigné' },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const forfaitsDetails = await prisma.forfait.findMany({
      where: { id: { in: top_forfaits.map(f => f.forfait_id) } },
      select: { id: true, nom: true }
    });

    const top_forfaits_enrichi = top_forfaits.map(f => ({
      ...f,
      nom: forfaitsDetails.find(fd => fd.id === f.forfait_id)?.nom || 'Inconnu'
    }));

    res.json({
      total_commandes,
      commandes_en_attente,
      commandes_mois,
      revenus_total: revenus_total._sum.montant || 0,
      revenus_mois: revenus_mois._sum.montant || 0,
      stock_disponible,
      stock_assigne,
      total_sites,
      total_forfaits,
      graphData,
      top_forfaits: top_forfaits_enrichi
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
