# Système de Répartition Dynamique des Leads

## 📋 Problème

Quand vous contactez 100 leads :
- **50 venant de Facebook** → 1 a acheté (taux: 2%)
- **50 venant d'Instagram** → 0 ont acheté (taux: 0%)

**Question :** Comment ajuster la répartition pour la prochaine campagne si avant c'était 50% / 50% ?

## 🎯 Solution : Répartition Adoucie par Score

Le système calcule automatiquement la nouvelle répartition basée sur :
1. **Les performances de conversion** (poidsVente)
2. **Le volume de leads** (poidsLead)
3. **Un facteur d'adoucissement** pour éviter les changements trop brusques

## 🔧 Paramètres

### poidsVente (70% par défaut)
- Importance donnée aux **ventes/conversions**
- Plus élevé = on favorise les canaux qui convertissent mieux
- Exemple : Facebook a converti 1/50 (2%), Instagram 0/50 (0%) → Facebook sera favorisé

### poidsLead (30% par défaut)
- Importance donnée au **volume de leads**
- Plus élevé = on favorise les canaux qui génèrent plus de leads
- Utile pour éviter de tout mettre sur un seul canal

### tauxConversionGlobal (0.001 = 0.1%)
- Taux de conversion moyen attendu
- Utilisé pour normaliser les scores de performance
- Aide à comparer les canaux de manière équitable

### smoothingFactor (0.3 = 30%)
- Facteur d'adoucissement pour éviter les changements brusques
- Plus proche de 0 = changements plus lents et progressifs
- Plus proche de 1 = changements plus rapides et agressifs
- **Recommandé : 0.2-0.4** pour un équilibre

## 📊 Exemple de Calcul

### Scénario initial
- **Facebook :** 50 leads, 1 vente (2% de conversion)
- **Instagram :** 50 leads, 0 ventes (0% de conversion)
- **Répartition actuelle :** 50% / 50%

### Calcul du score

**Facebook :**
- Score conversion : 2% / 0.1% = 20
- Score volume : log(51) / log(1000) ≈ 0.85
- Score combiné : (0.7 × 20) + (0.3 × 0.85) = **14.26**

**Instagram :**
- Score conversion : 0% / 0.1% = 0
- Score volume : log(51) / log(1000) ≈ 0.85
- Score combiné : (0.7 × 0) + (0.3 × 0.85) = **0.26**

**Total :** 14.26 + 0.26 = 14.52

### Répartition idéale
- **Facebook :** 14.26 / 14.52 = **98.2%**
- **Instagram :** 0.26 / 14.52 = **1.8%**

### Application de l'adoucissement (30%)
- **Facebook :** 50% + 0.3 × (98.2% - 50%) = **64.5%**
- **Instagram :** 50% + 0.3 × (1.8% - 50%) = **35.5%**

### Résultat final
- **Facebook :** **64.64%** (augmentation de 14.64%)
- **Instagram :** **35.36%** (diminution de 14.64%)

## 💻 Utilisation

### En ligne de commande

```bash
node lead-repartition-calculator.js
```

### Dans votre code

```javascript
const LeadRepartitionCalculator = require('./lead-repartition-calculator');

const calculator = new LeadRepartitionCalculator(
  0.7,    // poidsVente
  0.3,    // poidsLead
  0.001,  // tauxConversionGlobal
  0.3     // smoothingFactor
);

// Pour une campagne spécifique
await calculator.processCampaign('uuid-de-la-campagne');
```

### Calcul manuel

```javascript
const stats = {
  facebook: { leads: 50, ventes: 1 },
  instagram: { leads: 50, ventes: 0 }
};

const currentRepartition = {
  facebook: 50,
  instagram: 50
};

const newRepartition = calculator.calculateNewRepartition(stats, currentRepartition);
console.log(newRepartition);
// { facebook: 64.64, instagram: 35.36 }
```

## 🎛️ Ajustement des Paramètres

### Si vous voulez favoriser davantage les conversions
```javascript
new LeadRepartitionCalculator(0.9, 0.1, 0.001, 0.3)
// poidsVente = 90%, poidsLead = 10%
```

### Si vous voulez des changements plus progressifs
```javascript
new LeadRepartitionCalculator(0.7, 0.3, 0.001, 0.1)
// smoothingFactor = 10% (changements très lents)
```

### Si vous voulez des changements plus rapides
```javascript
new LeadRepartitionCalculator(0.7, 0.3, 0.001, 0.5)
// smoothingFactor = 50% (changements plus rapides)
```

## 📈 Évolution sur Plusieurs Itérations

Avec un `smoothingFactor` de 0.3, voici comment évolue la répartition :

| Itération | Facebook | Instagram |
|-----------|----------|-----------|
| Initial   | 50%      | 50%       |
| 1         | 64.6%    | 35.4%     |
| 2         | 73.2%    | 26.8%     |
| 3         | 78.2%    | 21.8%     |
| 4         | 81.3%    | 18.7%     |
| 5         | 83.2%    | 16.8%     |
| ...       | ...      | ...       |
| ∞         | 98.2%    | 1.8%      |

Cela permet une transition en douceur sans chocs brutaux.

## ⚠️ Points d'Attention

1. **Volume minimum** : Si un canal a très peu de leads, les statistiques peuvent être peu fiables
2. **Taux de conversion global** : Ajustez-le selon votre industrie et vos données historiques
3. **Seuils minimums** : Vous pouvez ajouter des seuils minimums (ex: ne jamais descendre en dessous de 10% pour un canal)
4. **Période d'analyse** : Déterminez sur quelle période analyser les performances (dernière semaine, dernier mois, etc.)

## 🔄 Intégration Automatique

Le système peut être intégré pour :
- Mettre à jour automatiquement la répartition après chaque campagne
- Analyser les performances sur une période glissante
- Envoyer des alertes si un canal sous-performe significativement

