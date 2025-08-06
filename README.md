# 🚀 MENZOJI Blog - PostgreSQL & Vercel

Blog moderne avec base de données PostgreSQL, prêt pour le déploiement sur Vercel.

## 🛠️ Technologies

- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL
- **Frontend** : HTML, CSS, JavaScript vanilla
- **Déploiement** : Vercel
- **Authentification** : Hashage SHA-256

## 📋 Prérequis

- Node.js >= 14.0.0
- PostgreSQL (local ou cloud)
- Compte Vercel

## 🚀 Installation locale

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd menzoji-blog
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de la base de données

#### Option A : PostgreSQL local
```bash
# Installer PostgreSQL
# Créer une base de données
createdb menzoji_blog

# Exécuter le script d'initialisation
psql -d menzoji_blog -f database/init.sql
```

#### Option B : PostgreSQL cloud (recommandé)
- Créer une base de données sur [Neon](https://neon.tech) ou [Supabase](https://supabase.com)
- Récupérer l'URL de connexion

### 4. Configuration des variables d'environnement

Créer un fichier `.env` :
```env
DATABASE_URL=postgresql://username:password@localhost:5432/menzoji_blog
PORT=3000
NODE_ENV=development
```

### 5. Démarrer le serveur
```bash
npm run dev
```

Le site sera accessible sur `http://localhost:3000`

## 🌐 Déploiement sur Vercel

### 1. Préparer la base de données

#### Option A : Neon (recommandé)
1. Aller sur [neon.tech](https://neon.tech)
2. Créer un compte et un projet
3. Récupérer l'URL de connexion
4. Exécuter le script `database/init.sql` dans l'éditeur SQL

#### Option B : Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un projet
3. Aller dans l'éditeur SQL
4. Exécuter le script `database/init.sql`

### 2. Déployer sur Vercel

#### Option A : Interface web
1. Aller sur [vercel.com](https://vercel.com)
2. Connecter votre compte GitHub
3. Importer le projet
4. Configurer les variables d'environnement :
   - `DATABASE_URL` : URL de votre base PostgreSQL
   - `NODE_ENV` : `production`

#### Option B : CLI Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Suivre les instructions et configurer les variables d'environnement
```

### 3. Configuration des variables d'environnement Vercel

Dans le dashboard Vercel, aller dans Settings > Environment Variables :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://user:password@host:port/database` |
| `NODE_ENV` | `production` |

## 🔐 Accès Dashboard

- **URL** : `https://votre-domaine.vercel.app/dashboard`
- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`

## 📊 Fonctionnalités

### Dashboard Admin
- ✅ Ajout/modification/suppression d'articles
- ✅ Gestion des catégories (liste déroulante)
- ✅ Statistiques en temps réel
- ✅ Authentification sécurisée

### Blog Public
- ✅ Affichage des articles par 2
- ✅ Recherche et filtrage
- ✅ Pagination
- ✅ Articles populaires
- ✅ Responsive design

### API REST
- `GET /api/posts` - Liste des articles
- `GET /api/posts/popular` - Articles populaires
- `GET /api/posts/category/:category` - Articles par catégorie
- `GET /api/posts/stats` - Statistiques
- `POST /api/posts` - Créer un article
- `PUT /api/posts/:id` - Modifier un article
- `DELETE /api/posts/:id` - Supprimer un article
- `PUT /api/posts/:id/views` - Incrémenter les vues

## 🗄️ Structure de la base de données

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url VARCHAR(500),
    date DATE DEFAULT CURRENT_DATE,
    popular BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement
npm run build      # Build pour Vercel
```

## 📁 Structure du projet

```
menzoji-blog/
├── config/
│   └── database.js          # Configuration PostgreSQL
├── models/
│   └── Post.js              # Modèle des articles
├── database/
│   └── init.sql             # Script d'initialisation DB
├── server.js                # Serveur Express
├── vercel.json              # Configuration Vercel
├── package.json             # Dépendances
└── [fichiers frontend...]
```

## 🚨 Troubleshooting

### Erreur de connexion PostgreSQL
- Vérifier l'URL de connexion dans les variables d'environnement
- S'assurer que la base de données est accessible
- Vérifier les paramètres SSL en production

### Erreur Vercel
- Vérifier que toutes les variables d'environnement sont configurées
- S'assurer que le fichier `vercel.json` est présent
- Vérifier les logs de build dans Vercel

## 📝 Migration depuis JSON

Si vous migrez depuis l'ancienne version JSON :

1. Sauvegarder les données JSON
2. Créer la base PostgreSQL
3. Exécuter le script d'initialisation
4. Utiliser le script de migration : `npm run migrate`
5. Déployer sur Vercel

## 🤝 Support

Pour toute question ou problème :
- Vérifier les logs Vercel
- Consulter la documentation PostgreSQL
- Vérifier la configuration des variables d'environnement

---

**🎉 Votre blog est maintenant prêt pour la production avec PostgreSQL et Vercel !** 