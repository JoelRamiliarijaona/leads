# 🚀 Backend NestJS - Répartition Dynamique des Leads

Backend pour calculer et mettre à jour automatiquement la répartition des leads entre canaux (Facebook, Instagram, etc.) basé sur les performances.

## 📋 Technologies

- **NestJS** - Framework Node.js
- **Prisma** - ORM pour PostgreSQL
- **TypeScript** - Type safety
- **Swagger** - Documentation API automatique

## 🏗️ Architecture

```
src/
├── database/           # Module Prisma
├── campaigns/          # Module des campagnes
│   ├── campaigns.repository.ts  # Accès DB
│   ├── campaigns.service.ts      # Logique métier
│   └── campaigns.controller.ts   # Endpoints REST
├── lead-repartition/   # Module de calcul
│   └── lead-repartition.service.ts
└── common/             # Interfaces et types partagés
```

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine :

```env
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
```

## 🏃 Démarrage

```bash
# Mode développement (avec watch)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000`
La documentation Swagger sur `http://localhost:3000/api`

## 📚 Endpoints API

### 1. Calculer et mettre à jour la répartition
```http
POST /campaigns/:uuid/repartition/calculate
Content-Type: application/json

{
  "poidsVente": 0.7,
  "poidsLead": 0.3,
  "tauxConversionGlobal": 0.001,
  "smoothingFactor": 0.3
}
```

### 2. Prévisualiser la répartition (sans sauvegarder)
```http
POST /campaigns/:uuid/repartition/preview
```

### 3. Obtenir les statistiques d'une campagne
```http
GET /campaigns/:uuid/stats
```

### 4. Mettre à jour manuellement la répartition
```http
PATCH /campaigns/:uuid/repartition
Content-Type: application/json

{
  "repartition": {
    "facebook": 60,
    "instagram": 40
  }
}
```

### 5. Lister les campagnes
```http
GET /campaigns?status=active&limit=10&offset=0
```

## 🔧 Paramètres de Répartition

- **poidsVente** (0.7 par défaut) : Importance des conversions
- **poidsLead** (0.3 par défaut) : Importance du volume
- **tauxConversionGlobal** (0.001 = 0.1%) : Taux de référence
- **smoothingFactor** (0.3 = 30%) : Vitesse d'ajustement

## 📊 Exemple de Réponse

```json
{
  "oldRepartition": {
    "facebook": 50,
    "instagram": 50
  },
  "newRepartition": {
    "facebook": 64.64,
    "instagram": 35.36
  },
  "stats": {
    "facebook": {
      "leads": 50,
      "ventes": 1,
      "conversionRate": 0.02
    },
    "instagram": {
      "leads": 50,
      "ventes": 0,
      "conversionRate": 0
    }
  },
  "scores": {
    "facebook": 14.26,
    "instagram": 0.26
  }
}
```

## 🧪 Tests

```bash
# Lancer les tests (à venir)
npm test
```

## 📝 Structure de la Base de Données

Le schéma Prisma est généré automatiquement depuis votre base PostgreSQL existante via `npx prisma db pull`.

Tables principales :
- `campaigns` - Campagnes avec `lead_canal_repartition`
- `lead_campaigns` - Relations leads/campagnes avec `canal` et `succeed`
- `leads` - Informations sur les leads

## 🔒 Sécurité

- Validation automatique des entrées (class-validator)
- Gestion d'erreurs structurée
- CORS activé

## 📖 Documentation

La documentation complète de l'API est disponible sur `/api` (Swagger UI) une fois le serveur démarré.

## 🛠️ Commandes Utiles

```bash
# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio (GUI pour la DB)
npm run prisma:studio

# Créer une migration
npm run prisma:migrate
```

## 📄 License

MIT

