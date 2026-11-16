# Dossier juridique (inactif) — à compléter et à faire vérifier

Ce dossier contient les **modèles** de documents nécessaires pour diffuser largement ou vendre le **Mémo SSIAP** (application de révision et d'aide-mémoire pour agents de sécurité incendie et agents de sécurité privée). Il n'est **pas actif** : rien dans l'application ne l'affiche tant que la vente n'est pas lancée. Les conditions d'utilisation **actuellement affichées dans l'appli** (page « Conditions d'utilisation ») restent la seule référence active.

> ⚠️ Ces textes sont des projets rédigés pour préparer le travail d'un professionnel. Ils **doivent être relus par un avocat** (ou un juriste) avant toute mise en vente. Les références légales citées sont celles en vigueur à la date de rédaction (novembre 2026) et peuvent avoir évolué.

> 🔒 **Aucune information personnelle de l'éditeur n'est écrite dans ce dépôt.** Tous les champs d'identité sont des encadrés `[À COMPLÉTER]`, à remplir par l'éditeur lui-même au moment voulu — soit dans les fichiers, soit à la main sur la **Fiche éditeur imprimable** (`Fiche-editeur-a-completer.md`).

## Contenu

| Fichier | Rôle |
|---|---|
| `Fiche-editeur-a-completer.md` | Fiche imprimable à remplir à la main et signer (identité de l'éditeur) |
| `Mentions-legales.md` | Identité de l'éditeur / vendeur (obligatoire, art. 6 LCEN) |
| `CGV.md` | Conditions générales de vente (contenu numérique vendu à distance) |
| `CGU-Licence.md` | Conditions d'utilisation et licence de l'application |
| `Confidentialite.md` | Politique de confidentialité (RGPD) |
| `Acceptation.md` | Texte d'acceptation à afficher dans l'appli + façon d'en garder la preuve |

## À compléter avant activation (chercher `[À COMPLÉTER]`)

1. Identité : nom/prénom ou raison sociale, forme juridique, SIREN/SIRET, adresse, e-mail, téléphone, n° de TVA (ou mention de franchise, art. 293 B CGI).
2. Hébergeur (GitHub est pré-rempli : Pages pour l'appli web, Releases pour l'APK ; compléter si autre hébergeur).
3. Prix, moyens de paiement, nom du prestataire de paiement.
4. Médiateur de la consommation choisi (obligatoire, art. L612-1 Code de la consommation) et ses coordonnées.
5. Durée des mises à jour garanties.
6. Contact pour les données personnelles.
7. Dans l'appli : les champs `D.meta.contact` et `D.meta.editeur` (en tête d'`index.html`), volontairement vides aujourd'hui.

## Points d'attention propres à cette application

- **Nature du contenu** : outil de révision **non officiel**. Les CGU doivent toujours répéter que l'appli ne remplace ni la formation, ni les textes en vigueur, ni les consignes — c'est déjà le cas dans l'appli.
- **Contenus embarqués** : textes officiels (libres de droits) et documents administratifs cités avec leur source ; schémas et questions rédigés pour l'appli. Pas de contenu tiers sous licence identifié à ce jour ; en cas d'ajout, vérifier la licence avant la vente.
- **Modules techniques** (Capacitor et extensions, dont le module de mise à jour) : vérifier leurs licences avant toute vente de l'APK.
- **Signalements** : si le serveur de signalements (Supabase) est activé un jour, mettre d'abord en place une limite d'envoi et revoir la règle de lecture, puis mettre à jour `Confidentialite.md` (voir le rapport d'audit du 01/11/2026).
- **Gemini** : optionnel, clé fournie par l'utilisateur, textes envoyés à Google uniquement sur action volontaire — déjà décrit dans les CGU de l'appli.
