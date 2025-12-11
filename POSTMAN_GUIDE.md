# 📮 Guide Postman - Endpoints API

## 🚀 Base URL

```
http://localhost:3000
```

---

## 📋 Liste des Endpoints

### 1. **Calculer et mettre à jour la répartition** ✅
**Méthode :** `POST`  
**URL :** `http://localhost:3000/campaigns/:uuid/repartition/calculate`

**Paramètres URL :**
- `uuid` : UUID de la campagne (ex: `97b2daee-218f-46f6-bcf5-08bf1098023f`)

**Body (JSON) :**
```json
{
  "poidsVente": 0.7,
  "poidsLead": 0.3,
  "tauxConversionGlobal": 0.001,
  "smoothingFactor": 0.3
}
```

**Body minimal (tous les champs sont optionnels) :**
```json
{}
```

**Réponse attendue (200 OK) :**
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

**Erreurs possibles :**
- `404` : Campagne non trouvée
- `400` : Erreur de validation

---

### 2. **Prévisualiser la répartition (sans sauvegarder)** 👁️
**Méthode :** `POST`  
**URL :** `http://localhost:3000/campaigns/:uuid/repartition/preview`

**Paramètres URL :**
- `uuid` : UUID de la campagne

**Body (JSON) :** Identique à l'endpoint précédent
```json
{
  "poidsVente": 0.7,
  "poidsLead": 0.3,
  "tauxConversionGlobal": 0.001,
  "smoothingFactor": 0.3
}
```

**Réponse attendue (200 OK) :** Identique à l'endpoint précédent, mais **sans mise à jour en base de données**

---

### 3. **Obtenir les statistiques d'une campagne** 📊
**Méthode :** `GET`  
**URL :** `http://localhost:3000/campaigns/:uuid/stats`

**Paramètres URL :**
- `uuid` : UUID de la campagne

**Body :** Aucun

**Réponse attendue (200 OK) :**
```json
{
  "campaignUuid": "97b2daee-218f-46f6-bcf5-08bf1098023f",
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
  "currentRepartition": {
    "facebook": 50,
    "instagram": 50
  }
}
```

**Erreurs possibles :**
- `404` : Campagne non trouvée

---

### 4. **Mettre à jour manuellement la répartition** ✏️
**Méthode :** `PATCH`  
**URL :** `http://localhost:3000/campaigns/:uuid/repartition`

**Paramètres URL :**
- `uuid` : UUID de la campagne

**Body (JSON) :**
```json
{
  "repartition": {
    "facebook": 60,
    "instagram": 40
  }
}
```

**Réponse attendue (200 OK) :**
```json
{
  "campaignUuid": "97b2daee-218f-46f6-bcf5-08bf1098023f",
  "repartition": {
    "facebook": 60,
    "instagram": 40
  }
}
```

**Erreurs possibles :**
- `404` : Campagne non trouvée
- `400` : La somme des pourcentages doit être égale à 100%

---

### 5. **Lister toutes les campagnes** 📋
**Méthode :** `GET`  
**URL :** `http://localhost:3000/campaigns`

**Query Parameters (optionnels) :**
- `status` : Filtrer par statut (ex: `draft`, `active`)
- `limit` : Nombre de résultats (ex: `10`)
- `offset` : Offset pour la pagination (ex: `0`)

**Exemples d'URLs :**
```
http://localhost:3000/campaigns
http://localhost:3000/campaigns?status=draft
http://localhost:3000/campaigns?limit=10&offset=0
http://localhost:3000/campaigns?status=active&limit=20&offset=10
```

**Body :** Aucun

**Réponse attendue (200 OK) :**
```json
{
  "campaigns": [
    {
      "uuid": "97b2daee-218f-46f6-bcf5-08bf1098023f",
      "status": "draft",
      "lead_count": 0,
      "lead_canal_repartition": {
        "facebook": 50,
        "instagram": 50
      },
      "created_at": "2025-12-09T16:35:49.384Z",
      "updated_at": "2025-12-09T16:35:49.384Z"
    }
  ],
  "total": 1
}
```

---

## 🧪 Exemples de Tests Postman

### **Test 1 : Obtenir les stats d'une campagne**

1. Créez une nouvelle requête GET
2. URL : `http://localhost:3000/campaigns/97b2daee-218f-46f6-bcf5-08bf1098023f/stats`
3. Cliquez sur "Send"
4. Vous devriez voir les statistiques de la campagne

### **Test 2 : Prévisualiser la nouvelle répartition**

1. Créez une nouvelle requête POST
2. URL : `http://localhost:3000/campaigns/97b2daee-218f-46f6-bcf5-08bf1098023f/repartition/preview`
3. Onglet "Body" → Sélectionnez "raw" → "JSON"
4. Collez ce JSON :
```json
{
  "poidsVente": 0.7,
  "poidsLead": 0.3
}
```
5. Cliquez sur "Send"
6. Vous verrez la nouvelle répartition calculée **sans** qu'elle soit sauvegardée

### **Test 3 : Calculer et mettre à jour la répartition**

1. Créez une nouvelle requête POST
2. URL : `http://localhost:3000/campaigns/97b2daee-218f-46f6-bcf5-08bf1098023f/repartition/calculate`
3. Onglet "Body" → Sélectionnez "raw" → "JSON"
4. Collez ce JSON :
```json
{}
```
5. Cliquez sur "Send"
6. La répartition sera **calculée ET sauvegardée** dans la base de données

### **Test 4 : Mettre à jour manuellement**

1. Créez une nouvelle requête PATCH
2. URL : `http://localhost:3000/campaigns/97b2daee-218f-46f6-bcf5-08bf1098023f/repartition`
3. Onglet "Body" → Sélectionnez "raw" → "JSON"
4. Collez ce JSON :
```json
{
  "repartition": {
    "facebook": 70,
    "instagram": 30
  }
}
```
5. Cliquez sur "Send"
6. La répartition sera mise à jour manuellement

### **Test 5 : Lister les campagnes**

1. Créez une nouvelle requête GET
2. URL : `http://localhost:3000/campaigns?limit=10`
3. Cliquez sur "Send"
4. Vous verrez la liste des campagnes

---

## 📝 Configuration Postman

### **Headers à ajouter (si nécessaire) :**

Pour les requêtes POST/PATCH, Postman ajoute automatiquement :
```
Content-Type: application/json
```

### **Variables d'environnement (optionnel) :**

Créez un environnement Postman avec :
- `base_url` : `http://localhost:3000`
- `campaign_uuid` : `97b2daee-218f-46f6-bcf5-08bf1098023f`

Puis utilisez dans vos URLs : `{{base_url}}/campaigns/{{campaign_uuid}}/stats`

---

## 🔍 Comment obtenir un UUID de campagne valide ?

### **Méthode 1 : Via l'endpoint GET /campaigns**
1. Appelez `GET http://localhost:3000/campaigns`
2. Copiez un `uuid` depuis la réponse

### **Méthode 2 : Via votre base de données**
```sql
SELECT uuid FROM campaigns LIMIT 1;
```

### **Méthode 3 : Via Prisma Studio**
```bash
npm run prisma:studio
```
Ouvrez `http://localhost:5555` et naviguez vers la table `campaigns`

---

## ⚠️ Erreurs Courantes

### **404 Not Found**
- Vérifiez que l'UUID de la campagne est correct
- Vérifiez que le serveur est démarré (`npm run start:dev`)

### **400 Bad Request**
- Vérifiez le format JSON du body
- Pour PATCH /repartition : la somme des pourcentages doit être 100%

### **500 Internal Server Error**
- Vérifiez la connexion à la base de données
- Vérifiez les logs du serveur

---

## 🎯 Scénario de Test Complet

1. **Obtenir les stats** → `GET /campaigns/:uuid/stats`
2. **Prévisualiser** → `POST /campaigns/:uuid/repartition/preview`
3. **Calculer et sauvegarder** → `POST /campaigns/:uuid/repartition/calculate`
4. **Vérifier les stats** → `GET /campaigns/:uuid/stats` (la répartition devrait avoir changé)

---

## 📚 Documentation Swagger

Une fois le serveur démarré, accédez à :
```
http://localhost:3000/api
```

Vous y trouverez la documentation interactive de tous les endpoints avec possibilité de tester directement depuis le navigateur !

