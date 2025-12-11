# 🚀 Guide de Démarrage

## 📋 Prérequis

- ✅ Node.js installé (v18 ou supérieur)
- ✅ PostgreSQL accessible
- ✅ Fichier `.env` configuré avec `DATABASE_URL`

## 🎯 Démarrage Rapide

### **Étape 1 : Vérifier les dépendances**

```bash
# Vérifier que node_modules existe
# Si ce n'est pas le cas, installer :
npm install
```

### **Étape 2 : Générer le client Prisma**

```bash
npm run prisma:generate
```

**Note :** Cette commande génère le client Prisma à partir du schéma. Elle doit être exécutée après chaque modification du schéma Prisma.

### **Étape 3 : Vérifier le fichier .env**

Assurez-vous que le fichier `.env` existe à la racine du projet avec :

```env
DATABASE_URL=postgresql://209p:e4a21cf4e833ca5d2ec6440de38b934e5ba29ec13113c859de26596a8fa61150@51.159.14.225:5438/growth
PORT=3000
```

### **Étape 4 : Démarrer le serveur**

#### **Mode Développement (recommandé)**
```bash
npm run start:dev
```

Cette commande :
- ✅ Démarre le serveur en mode watch (redémarre automatiquement à chaque modification)
- ✅ Affiche les logs en temps réel
- ✅ Active le hot-reload

#### **Mode Production**
```bash
# 1. Compiler le projet
npm run build

# 2. Démarrer
npm run start:prod
```

### **Étape 5 : Vérifier que le serveur fonctionne**

Une fois démarré, vous devriez voir :
```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api
```

## 🧪 Tester l'API

### **1. Via le navigateur**

Ouvrez dans votre navigateur :
- **Swagger UI** : http://localhost:3000/api
- **Test simple** : http://localhost:3000/campaigns

### **2. Via Postman**

Importez la collection `postman_collection.json` dans Postman et testez les endpoints.

### **3. Via curl**

```bash
# Lister les campagnes
curl http://localhost:3000/campaigns

# Obtenir les stats d'une campagne
curl http://localhost:3000/campaigns/{uuid}/stats
```

## 🔧 Commandes Utiles

```bash
# Démarrer en mode développement
npm run start:dev

# Compiler le projet
npm run build

# Démarrer en mode production
npm run start:prod

# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio (GUI pour la DB)
npm run prisma:studio

# Créer une migration Prisma
npm run prisma:migrate
```

## ⚠️ Dépannage

### **Erreur : "Cannot find module '@prisma/client'"**
```bash
npm run prisma:generate
```

### **Erreur : "ECONNREFUSED" (connexion DB)**
- Vérifiez que la base de données est accessible
- Vérifiez le `DATABASE_URL` dans `.env`
- Testez la connexion : `node test-connection.js` (si le fichier existe)

### **Erreur : "Port 3000 already in use"**
- Changez le port dans `.env` : `PORT=3001`
- Ou arrêtez le processus qui utilise le port 3000

### **Le serveur ne démarre pas**
```bash
# Vérifier les erreurs de compilation
npm run build

# Vérifier que toutes les dépendances sont installées
npm install
```

## 📊 Vérifier la Connexion à la Base de Données

Si vous voulez tester la connexion avant de démarrer :

```bash
# Via Prisma Studio
npm run prisma:studio
# Ouvre http://localhost:5555
```

## 🎯 Prochaines Étapes

Une fois le serveur démarré :

1. ✅ Accédez à Swagger : http://localhost:3000/api
2. ✅ Testez les endpoints avec Postman
3. ✅ Consultez les logs dans le terminal
4. ✅ Utilisez Prisma Studio pour voir les données : `npm run prisma:studio`

## 📝 Notes

- Le serveur redémarre automatiquement en mode `start:dev` à chaque modification
- Les logs s'affichent dans le terminal
- La documentation Swagger est mise à jour automatiquement
- Le port par défaut est 3000 (modifiable dans `.env`)

