# Mémo SSIAP

Le mémo de poche de l’agent de sécurité incendie (SSIAP 1, 2 et 3) et de l’agent de sécurité privée (APS). Il fonctionne sur téléphone, tablette et ordinateur, **même sans connexion internet** une fois installé.

## Ce que contient l’appli

- **61 fiches** (onglets Rappel et Règles) et **23 schémas** : le feu, les extincteurs (vues en coupe, mode d’emploi, étiquette), RIA, colonnes sèches, sprinkleurs, SSI, détecteurs, alarme, DAS, dégagements et unités de passage, éclairage de sécurité, désenfumage, portes coupe-feu, panneaux, évacuation, missions de terrain, secourisme, métier SSIAP, ERP et IGH, commission de sécurité, registre, vérifications, Code du travail, APSAD, agent de sécurité privée, nouveautés 2025-2026.
- **16 conduites à tenir** (feu, levée de doute, évacuation, arrêt cardiaque, gaz, colis suspect, attaque…) avec des boutons d’appel direct : 18, 112, 15, 17, 114, urgence gaz. Chacune peut se suivre **pas à pas, à voix haute**, une étape à la fois en grand.
- **Lecture à voix haute** de toutes les pages avec la voix du téléphone : rien à télécharger, marche sans internet. Le passage lu est surligné ; pause, retour, vitesse, arrêt. Les sigles sont bien prononcés.
- **Rapports d’incident** : on raconte l’incident **à la voix** (ou on l’écrit) et l’appli remplit le rapport (type, date, heures, lieu, chronologie, secours appelés), puis pose les questions sur ce qui manque, à l’écrit ou à voix haute. Ou bien assistant guidé étape par étape selon 14 types d’incident. Contrôle de qualité, ligne de main courante, copie, partage, impression ou PDF, signature au doigt. Les rapports restent sur le téléphone.
- **Mon planning** : les heures de la semaine avec le lieu, le motif et l’affaire. Ajout au clavier (horaires fréquents en un geste), **à la voix** (« hier de 18 h à 20 h 30, heures sup au tribunal, salle 4, affaire 24/1234 ») ou par **photo du planning imprimé** (lue par Gemini, puis vérifiée par vous). Totaux par jour et par semaine, heures supplémentaires, relevé du mois à copier ou à ouvrir dans un tableur.
- **Entraînement** : 213 questions corrigées et expliquées, chacune reliée à sa fiche. Quiz rapide, par thème et par niveau, examen blanc SSIAP 1 (30 questions, note sur 20), révision des erreurs, suivi des progrès. Les questions peuvent être lues à voix haute.
- **8 outils de calcul** : quel extincteur sur quel feu, catégorie d’un ERP, calcul de l’effectif, dégagements et UP, nombre d’extincteurs, visites de la commission de sécurité, recyclage SSIAP, carte professionnelle APS.
- **Veille réglementaire** : chaque lundi, un robot sur GitHub vérifie si les textes officiels cités par l’appli ont changé et l’indique dans l’appli (« vérification en cours »). Il ne modifie jamais l’appli tout seul.
- Recherche instantanée, 54 sigles expliqués, favoris, « Mes numéros du site », thème clair ou sombre, texte agrandi, page **Réglages** (voix, vitesse, Gemini, données).
- Chaque fiche cite ses sources (67 au total) avec la date de vérification.

## Mettre l’appli en ligne avec GitHub Pages (gratuit, une seule fois)

Les fichiers à envoyer sont tous dans le dossier **1-a-mettre-sur-github**, sans sous-dossier : on peut tout envoyer d’un coup, même depuis un téléphone.

1. Ouvrez [github.com](https://github.com) dans **Chrome** et connectez-vous.
2. Créez un dépôt : bouton **+** ou **New** → nom : `memo-ssiap` → **Public** → **Create repository**.
3. Sur la page du dépôt : lien **uploading an existing file** (ou **Add file → Upload files**). Choisissez **tous les fichiers** du dossier `1-a-mettre-sur-github`, puis **Commit changes**.
4. **Settings → Pages** : *Source* = **Deploy from a branch**, *Branch* = **main**, dossier **/ (root)** → **Save**.
5. Après une ou deux minutes, l’adresse de l’appli s’affiche en haut de la page Pages : `https://VOTRE-NOM.github.io/memo-ssiap/`.

Le dépôt est public : le code de l’appli est visible, mais **aucune donnée personnelle** n’y est. Les rapports, le planning et la clé Gemini restent sur chaque téléphone.

## Robot de veille réglementaire (une seule fois, facultatif)

Le robot tourne sur GitHub, gratuitement, chaque lundi vers 7 h. Il relit les pages officielles citées par l’appli (Légifrance, préfectures, SDIS, INRS…), repère celles qui ont changé et publie le résultat, que l’appli affiche dans **Outils → Veille réglementaire** (et par un message sur l’accueil). Avec une clé Gemini, il résume aussi chaque changement en français simple et cherche les nouveaux textes officiels publiés. Il ne modifie **jamais** le contenu de l’appli : chaque changement doit être vérifié, puis l’appli corrigée.

1. Envoyez les fichiers du dossier `1-a-mettre-sur-github` comme d’habitude (ils contiennent `veille.mjs` et `veille-sources.json`).
2. Créez le fichier du robot : sur la page du dépôt, **Add file → Create new file**. Comme nom, tapez exactement `.github/workflows/veille.yml`, puis collez le contenu du fichier `veille.yml` (dossier `3-robot-de-veille`) et **Commit changes**.
3. Clé Gemini (conseillé) : **Settings → Secrets and variables → Actions → New repository secret**. *Name* : `GEMINI_API_KEY`, *Secret* : votre clé (aistudio.google.com/apikey) → **Add secret**. La clé reste cachée : elle n’apparaît ni dans le code ni dans l’appli.
4. Premier essai : onglet **Actions → Veille réglementaire → Run workflow**. Après 1 à 3 minutes, une coche verte apparaît. La première fois, le robot enregistre l’état actuel des textes ; il signale les changements à partir de la fois suivante.

Ne supprimez pas les fichiers `veille.json` et `veille-etat.json` créés par le robot dans le dépôt. Si GitHub met un jour le robot en pause, réactivez-le dans l’onglet **Actions**.

## Installer l’appli sur le téléphone

- **Android** : ouvrez l’adresse **dans Chrome**, menu ⋮ → « Installer l’application » (ou « Ajouter à l’écran d’accueil »).
- **iPhone** : ouvrez l’adresse **dans Safari**, bouton Partager → « Sur l’écran d’accueil ».
- **Ordinateur** (Chrome ou Edge) : icône d’installation dans la barre d’adresse.

Après une première ouverture avec internet, l’appli fonctionne **sans réseau**.

**Important :** ouvrez toujours l’appli dans Chrome (ou Safari), ou depuis son icône. Les navigateurs intégrés à d’autres applis (WhatsApp, Facebook, l’aperçu de Claude…) n’ont pas de voix : la lecture à voix haute et la dictée n’y marchent pas.

## Voix et dictée

- **Lecture à voix haute** : elle utilise la voix française du téléphone. Si aucune voix n’est trouvée :
  - Android : Paramètres → Accessibilité (ou Système, Langues) → Synthèse vocale → Services Google → Installer les données vocales → Français (France).
  - iPhone : Réglages → Accessibilité → Contenu énoncé → Voix → Français.
- **Dictée** (parler à l’appli) : elle passe par le service vocal du téléphone (Google ou Apple) et demande souvent internet. **Sans réseau**, touchez une zone de texte puis le micro du clavier (Gboard, clavier de l’iPhone) : il marche souvent hors connexion. L’analyse du texte (rapport, heures) se fait toujours sur le téléphone, sans internet.

## Gemini, l’IA de Google (facultatif)

Gemini sert à **lire la photo du planning** et peut aider à **rédiger un rapport**. Il est désactivé par défaut ; tout le reste marche sans lui.

1. Créez une clé gratuite sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (avec votre compte Google).
2. Dans l’appli : **Outils → Réglages → Assistant Gemini** : cochez « Utiliser Gemini », collez la clé, **Enregistrer et tester**. Le modèle est choisi automatiquement.

La clé est enregistrée **seulement sur le téléphone** : elle n’est jamais dans les fichiers publiés sur GitHub. Ce qui est envoyé à Gemini (texte ou photo) part chez Google : n’envoyez ni noms de personnes, ni informations de santé, ni détails d’une affaire judiciaire (notez plutôt un numéro de dossier), et respectez les règles de votre employeur. Conditions : [ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms).

Le fichier `base-connaissances-ssiap.md` reprend tout le contenu de l’appli avec ses sources : on peut l’ajouter comme source dans **NotebookLM** ([notebooklm.google.com](https://notebooklm.google.com)) ou à un Gem de Gemini pour poser des questions. Une IA peut se tromper : vérifiez toujours dans la fiche.

## Mettre à jour l’appli

Envoyez les nouveaux fichiers du dossier `1-a-mettre-sur-github` sur GitHub (**Add file → Upload files**, ils remplacent les anciens ; les fichiers du robot de veille ne sont pas touchés). Au lancement suivant avec internet, l’appli affiche « Une nouvelle version du mémo est prête » : touchez **Mettre à jour**. Les rapports, le planning et les réglages sont conservés.

## Fiabilité du contenu

- Contenu vérifié le 21 octobre 2026 à partir des textes officiels (arrêté du 2 mai 2005, règlement de sécurité ERP, Code de la construction et de l’habitation, Code du travail, Code de la sécurité intérieure, Code pénal, Code de procédure pénale), de publications des préfectures, des SDIS et des ministères, et d’organismes de référence (INRS, CNPP).
- Les normes AFNOR et les référentiels APSAD sont payants : ils sont seulement résumés.
- En cas de doute, le texte officiel en vigueur et les consignes de votre site font foi. L’appli aide à réviser et à se rappeler les bons gestes ; elle ne remplace ni la formation, ni les consignes de l’établissement, ni les ordres des secours.
- Les totaux du planning sont indicatifs : l’employeur et la convention collective restent la référence pour le décompte des heures.

## Modifier le contenu (dossier `2-source-pour-modifier`)

Les données sont dans `src/data/*.js` (une fiche = un bloc avec ses sources). Pour reconstruire l’appli après une modification (Node.js 18 ou plus) :

```
node qa/check-data.js      # contrôle des liens et des sources
node build.mjs             # produit le site dans dist
python3 scripts/icons.py   # icônes (Playwright), si besoin
python3 qa/test-app.py     # tests dans le navigateur (Playwright)
node qa/test-veille.mjs    # test du robot de veille (pages et Gemini simulés)
```

Envoyez ensuite le contenu de `dist` sur GitHub.
