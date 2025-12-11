# 🔧 Dépannage - Erreur ECONNREFUSED

## ❌ Erreur : `ECONNREFUSED 127.0.0.1:3000`

Cette erreur signifie que **le serveur n'est pas démarré** ou **n'écoute pas sur le port 3000**.

---

## ✅ Solutions

### **Solution 1 : Démarrer le serveur**

Ouvrez un **nouveau terminal** dans le dossier du projet et exécutez :

```bash
npm run start:dev
```

**Vous devriez voir :**
```
🚀 Application is running on: http://localhost:3000
📚 Swagger documentation: http://localhost:3000/api
```

**⚠️ Important :** Gardez ce terminal ouvert ! Le serveur doit rester en cours d'exécution.

---

### **Solution 2 : Vérifier que le port 3000 est libre**

Si le port 3000 est déjà utilisé par un autre processus :

**Windows :**
```powershell
# Voir quel processus utilise le port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacez PID par le numéro trouvé)
taskkill /PID <PID> /F
```

**Ou changez le port dans `.env` :**
```env
PORT=3001
```

Puis redémarrez le serveur.

---

### **Solution 3 : Vérifier les erreurs de compilation**

Si le serveur ne démarre pas, vérifiez les erreurs :

```bash
# Compiler pour voir les erreurs
npm run build
```

**Erreurs courantes :**

1. **"Cannot find module '@prisma/client'"**
   ```bash
   npm run prisma:generate
   ```

2. **Erreurs TypeScript**
   - Vérifiez que tous les fichiers sont corrects
   - Vérifiez `tsconfig.json`

3. **Erreur de connexion à la base de données**
   - Vérifiez le `DATABASE_URL` dans `.env`
   - Testez la connexion

---

### **Solution 4 : Vérifier le fichier .env**

Assurez-vous que le fichier `.env` existe à la racine avec :

```env
DATABASE_URL=postgresql://209p:e4a21cf4e833ca5d2ec6440de38b934e5ba29ec13113c859de26596a8fa61150@51.159.14.225:5438/growth
PORT=3000
```

---

### **Solution 5 : Réinstaller les dépendances**

Si rien ne fonctionne :

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install

# Régénérer Prisma
npm run prisma:generate

# Redémarrer
npm run start:dev
```

---

## 🧪 Vérifier que le serveur fonctionne

Une fois le serveur démarré, testez dans un **nouveau terminal** :

```bash
# Test simple
curl http://localhost:3000/campaigns

# Ou ouvrez dans le navigateur
# http://localhost:3000/api
```

---

## 📋 Checklist de Démarrage

- [ ] ✅ `npm install` exécuté
- [ ] ✅ `npm run prisma:generate` exécuté
- [ ] ✅ Fichier `.env` existe avec `DATABASE_URL`
- [ ] ✅ `npm run start:dev` exécuté
- [ ] ✅ Le terminal affiche "Application is running on: http://localhost:3000"
- [ ] ✅ Le terminal reste ouvert (serveur en cours d'exécution)
- [ ] ✅ Test dans Postman/Insomnia avec l'URL correcte

---

## 🎯 Commandes Rapides

```bash
# 1. Générer Prisma
npm run prisma:generate

# 2. Démarrer le serveur
npm run start:dev

# 3. Dans un autre terminal, tester
curl http://localhost:3000/campaigns
```

---

## ⚠️ Erreurs Courantes

### **"Port 3000 already in use"**
→ Un autre processus utilise le port. Tuez-le ou changez le port.

### **"Cannot find module '@prisma/client'"**
→ Exécutez `npm run prisma:generate`

### **"ECONNREFUSED"**
→ Le serveur n'est pas démarré. Exécutez `npm run start:dev`

### **Erreur de connexion DB**
→ Vérifiez `DATABASE_URL` dans `.env`

---

## 💡 Astuce

**Gardez toujours 2 terminaux ouverts :**
1. **Terminal 1** : Serveur en cours d'exécution (`npm run start:dev`)
2. **Terminal 2** : Pour exécuter d'autres commandes

Le serveur doit **rester en cours d'exécution** pour que les requêtes fonctionnent !

