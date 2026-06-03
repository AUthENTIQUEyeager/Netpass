const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middlewares/auth');

const prisma = new PrismaClient();

// POST /api/commandes — public, créer une commande
router.post('/', async (req, res) => {
  try {
    const { forfait_id, site_id, client_tel } = req.body;
    if (!forfait_id || !site_id) return res.status(400).json({ error: 'Forfait et site requis' });

    const forfait = await prisma.forfait.findUnique({ where: { id: forfait_id, actif: true } });
    if (!forfait) return res.status(404).json({ error: 'Forfait introuvable' });

    const site = await prisma.site.findUnique({ where: { id: site_id, actif: true } });
    if (!site) return res.status(404).json({ error: 'Site introuvable' });

    const commande = await prisma.commande.create({
      data: {
        forfait_id,
        site_id,
        client_tel: client_tel || null,
        montant: forfait.prix,
        statut: 'en_attente'
      }
    });

    res.json({
      commande_id: commande.id,
      checkout_url: forfait.wave_link,
      forfait: { nom: forfait.nom, prix: forfait.prix, duree_heures: forfait.duree_heures, vitesse: forfait.vitesse },
      site: { nom: site.nom, ville: site.ville }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/commandes/:id — public, statut + ticket si disponible
router.get('/:id', async (req, res) => {
  try {
    const commande = await prisma.commande.findUnique({
      where: { id: req.params.id },
      include: {
        forfait: { select: { nom: true, duree_heures: true, vitesse: true, prix: true } },
        site: { select: { nom: true, ville: true } },
        ticket: {
          include: {
            voucher: { select: { username: true, password: true } }
          }
        }
      }
    });
    if (!commande) return res.status(404).json({ error: 'Commande introuvable' });

    res.json({
      id: commande.id,
      statut: commande.statut,
      montant: commande.montant,
      forfait: commande.forfait,
      site: commande.site,
      created_at: commande.created_at,
      ticket: commande.ticket ? {
        username: commande.ticket.voucher.username,
        password: commande.ticket.voucher.password,
        date_expiration: commande.ticket.date_expiration,
        date_assignation: commande.ticket.date_assignation
      } : null
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/commandes — admin, liste des commandes
router.get('/', auth, async (req, res) => {
  try {
    const { statut, page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (statut) where.statut = statut;

    const [commandes, total] = await Promise.all([
      prisma.commande.findMany({
        where,
        include: {
          forfait: { select: { nom: true, prix: true } },
          site: { select: { nom: true, ville: true } },
          ticket: {
            include: { voucher: { select: { username: true } } }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.commande.count({ where })
    ]);

    res.json({ commandes, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/commandes/client/:tel — public, retrouver ticket par numéro
router.get('/client/:tel', async (req, res) => {
  try {
    const tel = req.params.tel.replace(/\s/g, '');
    const commande = await prisma.commande.findFirst({
      where: { client_tel: { contains: tel }, ticket: { isNot: null } },
      include: {
        forfait: { select: { nom: true, duree_heures: true, vitesse: true } },
        site: { select: { nom: true, ville: true } },
        ticket: { include: { voucher: { select: { username: true, password: true } } } }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!commande || !commande.ticket) {
      return res.status(404).json({ error: 'Aucun ticket trouvé pour ce numéro' });
    }

    res.json({
      forfait: commande.forfait.nom,
      vitesse: commande.forfait.vitesse,
      duree: commande.forfait.duree_heures,
      site: commande.site.nom,
      ville: commande.site.ville,
      username: commande.ticket.voucher.username,
      password: commande.ticket.voucher.password,
      date_expiration: commande.ticket.date_expiration
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
