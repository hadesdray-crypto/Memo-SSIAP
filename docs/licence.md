# Licence de l'application (fonctionnement)
- Essai gratuit de 90 jours à la première ouverture (constante LIC_ESSAI_JOURS dans index.html).
- Compteur local : temps de confiance qui ne recule jamais ; un recul de la date du téléphone ajoute un jour de pénalité.
- Codes : 12 octets (version, type, date de fin, série, appareil) + signature ECDSA P-256, en base32. Vérifiés hors connexion avec la clé publique intégrée.
- La clé privée n'est JAMAIS dans ce dépôt. L'outil de fabrication des codes est gardé par l'éditeur.
- À la fin : jeu et outils bloqués ; fiches, conduites à tenir, numéros d'urgence et textes légaux restent accessibles.
