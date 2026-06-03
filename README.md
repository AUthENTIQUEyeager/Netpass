# WifiPass — Plateforme de tickets WiFi

Vente de tickets WiFi via Wave, avec gestion de stock de vouchers MikroTik.

## Architecture

```
GitHub (ce repo)
  ├── frontend/   → Vercel  (Next.js)
  └── backend/    → Render  (Node.js)
                       └── Supabase (PostgreSQL)
```

## Déploiement

### 1. Supabase
- Créer un projet sur supabase.com
- Récupérer les URLs de connexion dans **Settings → Database → Connection string**
  - **Transaction** (port 6543) → DATABASE_URL
  - **Session** (port 5432) → DIRECT_URL

### 2. Render (Backend)
- New Web Service → connecter ce repo GitHub
- Root Directory : `backend`
- Build Command : `npm install && npx prisma generate && npx prisma db push --accept-data-loss`
- Start Command : `npm start`
- Variables d'environnement :

```
DATABASE_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=votre_cle_secrete_64_caracteres
FRONTEND_URL=https://votre-app.vercel.app
PORT=3001
```

- Après déploiement : notez l'URL du service et le Deploy Hook (Settings)

### 3. Vercel (Frontend)
- New Project → importer ce repo GitHub
- Root Directory : `frontend`
- Variable d'environnement :

```
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
```

### 4. GitHub Secrets
Settings → Secrets → Actions :
```
RENDER_DEPLOY_HOOK_URL = [URL du deploy hook Render]
```

### 5. Créer le premier admin
```bash
curl -X POST https://votre-backend.onrender.com/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemple.com","password":"MotDePasse123!","nom":"Admin"}'
```

---

## Workflow quotidien

1. **Générer des vouchers** dans Winbox MikroTik
2. **Les importer** dans Admin → Vouchers (coller username/password)
3. **Client paie** via Wave sur la page forfaits
4. **Admin assigne** le voucher dans Admin → Commandes
5. **Client voit** ses identifiants sur la page d'attente

## Mise à jour
```bash
git add .
git commit -m "description"
git push origin main
```
