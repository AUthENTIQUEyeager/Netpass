require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

app.use('/api/auth',      authLimiter,   require('./routes/auth'));
app.use('/api/forfaits',  publicLimiter, require('./routes/forfaits'));
app.use('/api/sites',     publicLimiter, require('./routes/sites'));
app.use('/api/commandes', publicLimiter, require('./routes/commandes'));
app.use('/api/vouchers',                 require('./routes/vouchers'));
app.use('/api/stats',                    require('./routes/stats'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'WifiPass API' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════╗`);
  console.log(`║  WifiPass API — Port ${PORT}   ║`);
  console.log(`╚══════════════════════════════╝\n`);
});

module.exports = app;
