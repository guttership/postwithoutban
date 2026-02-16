# Guide de Test Rapide - Nouveau Système d'Analyse

## Tests Immédiats à Faire

### Test 1️⃣ : SaaS Mature (Attendu : Excellente analyse)

**URL à tester** : `https://www.notion.so`

**Ce qu'on devrait voir** :
- ✅ `coreProblem` : Quelque chose comme "perdre du temps à chercher des infos éparpillées dans 5 outils différents"
- ✅ `emotionalJob` : "stress de ne pas retrouver une info importante", "frustration"
- ✅ `targetAudience` : "Teams de 5-50 personnes", ultra-précis
- ✅ `redFlags` : Devrait identifier le langage marketing de Notion
- ✅ Subreddits : r/productivity, r/notion, r/SaaS avec rationale détaillé
- ✅ Post Reddit : 300-500 mots, authentique, mentionne des limitations
- ✅ `tacticalAdvice` : Actions concrètes avant/pendant/après

---

### Test 2️⃣ : MVP Early Stage (Attendu : Conseils adaptés)

**URL à tester** : `https://www.producthunt.com/products/your-favorite-mvp`

**Ce qu'on devrait voir** :
- ✅ `maturityLevel` : "MVP"
- ✅ Angle recommandé : "Feedback request", pas "vente"
- ✅ `redFlags` : Détecte si trop marketing
- ✅ Post Reddit : Admet l'imperfection, demande feedback brutal
- ✅ `alternativeStrategy` : Si pas prêt, plan B fourni

---

### Test 3️⃣ : Site Trop Marketing (Attendu : Red flags détectés)

**Créer une landing page test avec** :
- "Solution révolutionnaire"
- "Game-changer"
- "Augmentez votre productivité de 300%"
- CTA agressifs

**Ce qu'on devrait voir** :
- ✅ `redFlags` : Array de 5+ éléments
- ✅ `warning` : Avertissement sur le ton marketing
- ✅ Suggestions de reformulation dans le post Reddit

---

### Test 4️⃣ : Niche Ultra-Spécifique (Attendu : Subreddits de niche)

**Exemple** : Outil de time tracking pour développeurs freelances

**Ce qu'on devrait voir** :
- ✅ Subreddits : r/freelance_forhire, r/webdev, PAS juste r/SaaS
- ✅ `explanation` : Rationale détaillé POURQUOI ce sub
- ✅ `anticipatedObjections` : "Toggl existe déjà", etc
- ✅ `responseStrategy` : Réponses pré-écrites

---

### Test 5️⃣ : Pas de Produit (Attendu : worthIt=false)

**URL à tester** : Page "Coming soon" sans MVP

**Ce qu'on devrait voir** :
- ✅ `worthIt` : false
- ✅ `warning` : "Pas prêt pour Reddit, vous allez vous faire massacrer"
- ✅ `alternativeStrategy` : "Code un MVP en 2-3 semaines, ENSUITE..."

---

## Command Line Tests

### Test API en Local

```powershell
# 1. Démarre le serveur (dans un terminal)
npm run dev

# 2. Dans un autre terminal PowerShell, teste l'API
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    url = "https://www.notion.so"
    description = "Outil de gestion de projets et notes"
} | ConvertTo-Json

# Test en mode démo (pas besoin de token)
$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/analyze" `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -ContentType "application/json"

# Affiche la réponse (devrait être un JSON)
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Check Points à Vérifier

#### ✅ Longueur de la Réponse
```powershell
# La réponse devrait faire 2000-5000 caractères minimum
$response.Content.Length
# Si < 1000 : Problème, analyse trop courte
# Si 2000-8000 : Parfait
# Si > 10000 : Peut-être trop verbeux
```

#### ✅ Structure JSON
```powershell
$json = $response.Content | ConvertFrom-Json

# Vérifier les nouveaux champs
$json.websiteAnalysis.emotionalJob          # Devrait exister
$json.websiteAnalysis.redFlags              # Devrait être un array
$json.subreddits[0].anticipatedObjections   # Devrait avoir 3-5 objections
$json.tacticalAdvice.beforePosting          # Devrait avoir 2-4 actions
$json.realisticEstimates.alternativeStrategy # Devrait exister
```

#### ✅ Qualité du Post Reddit
```powershell
$post = $json.redditPost.body
$wordCount = ($post -split '\s+').Count

Write-Host "Longueur du post: $wordCount mots"
Write-Host "Contient 'je/nous':", ($post -match 'je |nous ')
Write-Host "Contient des superlatifs:", ($post -match 'révolutionnaire|game-changer|incroyable|unique')
Write-Host "Contient une question:", ($post -match '\?')

# Attendu :
# - wordCount : 300-500
# - Contient 'je/nous' : True
# - Contient superlatifs : False
# - Contient une question : True
```

---

## Tests dans le Frontend

### 1. Page /demo

```
1. Aller sur http://localhost:3000/demo
2. Entrer une URL : https://www.notion.so
3. Cliquer "Analyser"
4. Attendre 15-30 secondes (normal, Gemini prend du temps)
5. Vérifier :
   - Section "Analyse du Site" : Devrait avoir 7 champs (pas 3)
   - Section "Subreddits Recommandés" : Chaque sub devrait avoir 9 champs
   - Section "Post Reddit" : Devrait faire 300-500 mots minimum
   - Section "Conseils Tactiques" : Nouvelle section avec 3 sous-parties
   - Section "Estimations" : Devrait avoir 7 champs (pas 4)
```

### 2. Vérifier l'Authenticité

Lire le post Reddit généré et se demander :
- ❓ Est-ce que ça sonne comme écrit par un humain ?
- ❓ Y a-t-il du contexte personnel ?
- ❓ Des limitations sont-elles admises ?
- ❓ Y a-t-il une question ouverte à la fin ?
- ❓ Le ton est-il humble, pas marketing ?

Si réponse OUI aux 5 : ✅ Succès  
Si réponse NON à 2+ : ❌ Problème, ajuster le prompt

---

## Debug Common Issues

### ❌ Erreur : "Erreur de parsing de la reponse IA"

**Cause** : Gemini retourne du markdown avec backticks

**Solution** : Vérifier dans route.ts lignes 388-398 (nettoyage du JSON)

```typescript
// Devrait déjà être là, mais vérifier
if (cleanedText.startsWith("```json")) {
  cleanedText = cleanedText.slice(7);
}
```

---

### ❌ Le post Reddit est trop court (< 200 mots)

**Cause** : Gemini ignore les instructions de longueur

**Solution** : Augmenter la température

```typescript
// Dans route.ts
generationConfig: {
  temperature: 0.9,  // était 0.8, augmente à 0.9
  maxOutputTokens: 8192,
}
```

---

### ❌ Le post Reddit sonne encore "IA"

**Cause** : SYSTEM_PROMPT pas assez stricte

**Solution** : Ajouter dans SYSTEM_PROMPT section "INTERDIT" :

```
=== PHRASES INTERDITES ===

N'utilise JAMAIS :
- "Je suis ravi de partager"
- "N'hésitez pas à"
- "En conclusion"
- "Faites-moi savoir"
- Tout ce qui sonne "corporate/formel"

UTILISE plutôt :
- "Voici ce que j'ai appris"
- "Dites-moi si c'est nul"
- "Bref,"
- "Genre, vous faites comment vous ?"
```

---

### ❌ Les red flags ne sont pas détectés

**Cause** : Le site n'a pas de contenu "marketing" évident

**Solution** : Normal si le site est sobre. Tester avec un site qui a vraiment "révolutionnaire", "game-changer", etc.

---

### ❌ worthIt est toujours true

**Cause** : L'IA n'est pas assez critique

**Solution** : Renforcer dans userPrompt :

```
SOIS BRUTALEMENT HONNÊTE:
- Si le site n'a QUE une landing page → worthIt = false
- Si le produit est "coming soon" → worthIt = false
- Si le ton est 100% marketing → worthIt = false
- Si tu ne vois AUCUN screenshot/démo → worthIt = false
```

---

### ❌ Timeout / Erreur API Gemini

**Cause** : Rate limit ou clé API invalide

**Debug** :
```powershell
# Vérifier la clé API
echo $env:GEMINI_API_KEY

# Si vide, la définir
$env:GEMINI_API_KEY = "votre-cle-api"

# Redémarrer le serveur
npm run dev
```

---

## Checklist Finale Avant Production

- [ ] Build compile sans erreurs (`npm run build` ✅)
- [ ] Tests avec 5 URLs différentes
- [ ] Posts Reddit générés font 300+ mots
- [ ] Red flags détectés sur sites marketing
- [ ] worthIt=false sur produits pas prêts
- [ ] tacticalAdvice présent dans toutes les réponses
- [ ] Subreddits ont des objections anticipées
- [ ] alternativeStrategy fournie si worthIt=false
- [ ] Aucune erreur dans la console frontend
- [ ] Temps de réponse < 30 secondes

---

## Next Steps Après Tests

### Si tout fonctionne ✅
```powershell
git add .
git commit -m "feat: amélioration drastique analyse Reddit - système v2.0"
git push origin main
```

### Si problèmes détectés ⚠️
1. Noter les problèmes spécifiques
2. Ajuster SYSTEM_PROMPT dans route.ts
3. Re-tester
4. Itérer jusqu'à satisfaction

---

## Métriques de Succès

Après 1 semaine en production, vérifier :

| Métrique | Target |
|----------|--------|
| **Taux de satisfaction** | 4+ / 5 |
| **Longueur moyenne post** | 350+ mots |
| **worthIt = true** | 60-70% |
| **Red flags détectés** | 2-5 par site |
| **Temps de réponse** | < 30 sec |
| **Taux d'utilisation du post** | 70%+ |

---

**Bon test ! 🚀**
