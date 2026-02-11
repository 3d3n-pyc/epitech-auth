# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]


### À venir
- Support multi-plateforme d'authentification
- Tableau de bord d'administration
- Logs d'audit avancés

---

## [1.0.0] - 2025-10-31

### Ajouté
- **Authentification Microsoft Entra ID** : Système d'authentification complet via Microsoft
- **Génération de codes** : Création de codes d'authentification uniques et sécurisés
- **Gestion de sessions** : Sessions sécurisées avec express-session
- **Sécurité PKCE** : Implémentation du protocole PKCE pour sécuriser les échanges
- **API REST** :
  - `POST /auth/generate-code` : Génération de codes d'authentification
  - `GET /auth/microsoft` : Redirection vers Microsoft pour authentification
  - `GET /auth/microsoft/callback` : Traitement du retour d'authentification
  - `GET /auth/check/:code` : Vérification du statut d'authentification
- **Expiration automatique** : Les codes expirent après 5 minutes
- **Base de données** : Intégration PostgreSQL via Prisma ORM
- **Pages d'interface** :
  - Page de succès d'authentification
  - Page d'erreur avec détails
  - Page d'expiration de code
  - Page 404 personnalisée
  - Page des Conditions Générales d'Utilisation
- **Design système** :
  - CSS commun réutilisable
  - Composant logo avec tooltip
  - Design responsive et moderne
  - Animations CSS élégantes
- **Branding** :
  - Logo en bas à droite avec tooltip "Made with 💖 by 3d3n"
  - Affichage de la version en bas à gauche
  - Favicon support
- **Configuration** :
  - Port configurable via variable d'environnement
  - Support de deux schémas Prisma (dev et Vercel)
  - Variables d'environnement pour Azure AD
- **Sécurité** :
  - API protégée par secret (API_SECRET)
  - Sessions sécurisées
  - Validation des codes à usage unique
  - Protection CSRF via PKCE

### Technique
- **Stack** :
  - Node.js avec TypeScript 5.9.3
  - Express 5.1.0
  - Prisma 6.18.0
  - MSAL Node 3.8.1
- **Déploiement** :
  - Support Vercel avec configuration spécifique
  - Scripts de build optimisés
  - Database push automatique sur Vercel
- **Architecture** :
  - Structure modulaire (routes, services, middleware)
  - Système de templates HTML avec composants réutilisables
  - Gestion centralisée de la configuration
  - Helpers utilitaires (PKCE, templates, codes)

### Documentation
- README.md avec instructions complètes
- CGU conformes au RGPD
- Schéma de base de données documenté

---

## [1.0.1] - 2025-10-31

### Corrigé
- Correction du schéma Prisma (`schema.vercel.prisma`) pour la base de données PostgreSQL.

---

## Format des versions

### Types de changements
- **Ajouté** : pour les nouvelles fonctionnalités
- **Modifié** : pour les changements dans les fonctionnalités existantes
- **Déprécié** : pour les fonctionnalités qui seront bientôt supprimées
- **Supprimé** : pour les fonctionnalités supprimées
- **Corrigé** : pour les corrections de bugs
- **Sécurité** : en cas de vulnérabilités

### Versioning sémantique
- **MAJOR** (X.0.0) : Changements incompatibles avec les versions précédentes
- **MINOR** (0.X.0) : Ajout de fonctionnalités compatibles avec les versions précédentes
- **PATCH** (0.0.X) : Corrections de bugs compatibles avec les versions précédentes

---

## Liens
- [Dépôt GitHub](https://github.com/3d3n-pyc/epitech-auth)
- [Issues](https://github.com/3d3n-pyc/epitech-auth/issues)
- [Pull Requests](https://github.com/3d3n-pyc/epitech-auth/pulls)

---

**Made with 💖 by 3d3n**
