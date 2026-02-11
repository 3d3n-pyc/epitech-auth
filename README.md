# 🔐 Epitech Auth - Système d'Authentification Microsoft OAuth

Un système d'authentification OAuth moderne permettant à des applications tierces (comme des serveurs Minecraft, Discord bots, etc.) d'authentifier leurs utilisateurs via Microsoft Entra ID (Azure AD).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748.svg)](https://www.prisma.io/)

> 📝 **[Voir le CHANGELOG](./CHANGELOG.md)** pour l'historique des versions et modifications

## 🎯 Fonctionnalités

- ✅ **Authentification Microsoft** via OAuth2 avec PKCE
- ✅ **API REST** pour intégration avec n'importe quelle application
- ✅ **Codes temporaires** sécurisés (expiration 5 minutes)
- ✅ **Interface moderne** minimaliste (noir/blanc/gris)
- ✅ **Architecture modulaire** et scalable
- ✅ **TypeScript** avec typage strict
- ✅ **Base de données** SQLite (facilement remplaçable)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- npm ou yarn
- Un compte Microsoft Azure (pour créer une application)

### Installation

```bash
# Cloner le repository
git clone https://github.com/3d3n-pyc/epitech-auth.git
cd epitech-auth

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
```

### Configuration

Éditez le fichier `.env` avec vos informations Azure :

```env
# Database
DATABASE_URL="file:./dev.db"

# Azure/Microsoft Entra ID
AZURE_CLIENT_ID=votre_client_id
AZURE_CLIENT_SECRET=votre_client_secret
AZURE_TENANT_ID=votre_tenant_id

# OAuth2 Redirect URI
BASE_URL=http://localhost:3000/auth/microsoft/callback

# Session
SESSION_SECRET=votre_secret_aleatoire_tres_long
```

### Initialiser la base de données

```bash
# Créer les tables
npm run db:push

# Générer le client Prisma
npm run db:generate
```

### Lancer le serveur

```bash
# Mode développement
npm run dev

# Mode développement avec hot-reload
npm run dev:watch
```

Le serveur démarre sur **http://localhost:3000** 🚀

## 📖 Utilisation

### Flux d'authentification en 3 étapes

#### 1️⃣ Générer un code d'authentification

```bash
POST /auth/generate-code
```

**Réponse :**
```json
{
  "code": "abc123...",
  "authUrl": "http://localhost:3000/auth/microsoft?code=abc123...",
  "expiresAt": "2025-10-30T10:35:00.000Z",
  "message": "Veuillez vous rendre sur authUrl pour vous authentifier"
}
```

#### 2️⃣ L'utilisateur s'authentifie

L'utilisateur visite l'URL `authUrl` et est redirigé vers Microsoft pour se connecter.

#### 3️⃣ Vérifier l'authentification

```bash
GET /auth/check/:code
```

**Réponse (authentifié) :**
```json
{
  "authenticated": true,
  "status": "authenticated",
  "user": {
    "id": 1,
    "azureOid": "...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "authenticatedAt": "2025-10-30T10:32:15.000Z"
}
```

## 🏗️ Architecture

```
src/
├── config/          # Configuration (Prisma, MSAL, env)
├── middleware/      # Middlewares Express
├── routes/          # Endpoints API
├── services/        # Logique métier
├── types/           # Types TypeScript
├── utils/           # Fonctions utilitaires
├── views/           # Templates HTML
└── server.ts        # Point d'entrée
```

## 📡 API Endpoints

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/auth/generate-code` | Génère un code d'authentification | ✅ API Secret |
| GET | `/auth/microsoft?code=xxx` | Lance le flux OAuth Microsoft | ❌ Public |
| GET | `/auth/microsoft/callback` | Callback après authentification | ❌ Public |
| GET | `/auth/check/:code` | Vérifie le statut d'authentification | ✅ API Secret |

**Note** : Les endpoints protégés nécessitent le header `x-api-secret` avec votre clé API.

## 🛠️ Scripts disponibles

```bash
npm run dev              # Lance le serveur en mode développement
npm run dev:watch        # Lance avec hot-reload
npm run build            # Compile TypeScript (détecte automatiquement Vercel)
npm run start            # Lance le serveur en production
npm run db:push          # Synchronise le schéma local (schema.prisma)
npm run db:push:vercel   # Synchronise le schéma Vercel (schema.vercel.prisma)
npm run db:migrate       # Crée une migration Prisma (local)
npm run db:generate      # Génère le client Prisma (local)
```

## 🚀 Déploiement

### Vercel (recommandé)

Ce projet est optimisé pour Vercel. Il utilise automatiquement le fichier `prisma/schema.vercel.prisma` lors du déploiement grâce à la configuration dans `package.json` et `vercel.json`.

**Étapes rapides** :
1. Push votre code sur GitHub/GitLab
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Configurez les variables d'environnement (`DATABASE_POSTGRES_URL`, etc.)
4. Vérifiez que la commande de build utilise `npm run build` (par défaut) ou `npm run vercel-build` si vous souhaitez mettre à jour le schéma DB automatiquement.
5. Déployez !

**Note sur les Schémas Prisma** :
- `prisma/schema.prisma` : Utilisé localement (souvent avec SQLite ou une DB de dev).
- `prisma/schema.vercel.prisma` : Utilisé sur Vercel (souvent optimisé pour Postgres/Vercel Storage).

⚠️ **Important** : Pour la production, utilisez PostgreSQL au lieu de SQLite.

## 🎨 Stack technique

- **Runtime** : Node.js 20+ avec TypeScript
- **Framework** : Express 5
- **Base de données** : SQLite (dev) / PostgreSQL (prod)
- **ORM** : Prisma
- **Auth** : Microsoft MSAL (OAuth2 + PKCE)
- **Session** : express-session
- **Dev tools** : tsx, TypeScript

## 🔧 Configuration Azure

### Créer une application Azure AD

1. Allez sur [Azure Portal](https://portal.azure.com)
2. Naviguez vers **Azure Active Directory** > **App registrations**
3. Cliquez sur **New registration**
4. Configurez :
   - **Name** : Epitech Auth
   - **Supported account types** : Single tenant
   - **Redirect URI** : Web - `http://localhost:3000/auth/microsoft/callback`
5. Notez le **Application (client) ID** et **Directory (tenant) ID**
6. Créez un **Client secret** dans **Certificates & secrets**
7. Ajoutez ces valeurs dans votre `.env`

## 🐛 Dépannage

### Le serveur ne démarre pas

- Vérifiez que toutes les variables d'environnement sont définies dans `.env`
- Assurez-vous que le port 3000 n'est pas déjà utilisé
- Vérifiez que Prisma est bien configuré avec `npm run db:generate`

### Les authentifications échouent

- Vérifiez vos credentials Azure dans `.env`
- Assurez-vous que l'URL de redirection correspond dans Azure et `.env`
- Vérifiez que votre application Azure a les bonnes permissions

### Les codes expirent trop vite

Les codes expirent après 5 minutes pour des raisons de sécurité. 
Vous pouvez modifier cette durée dans `src/services/authCode.service.ts` :

```typescript
const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
