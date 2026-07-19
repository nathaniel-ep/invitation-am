# Stockage des réponses RSVP dans Google Sheets

Le site est 100 % statique (déployé sur Vercel). Les réponses du formulaire
sont envoyées à un Google Sheet via un petit script Google Apps Script.

## Mise en place (~5 min, à faire avec le compte Google choisi)

1. Créer un Google Sheet, par ex. **« Réponses mariage Anthony & Mélissa »**.
   (Pas besoin de créer les colonnes : le script écrit les en-têtes tout seul.)

2. Dans le Sheet : **Extensions → Apps Script**, supprimer le contenu par
   défaut et coller le contenu de [`google-apps-script.gs`](google-apps-script.gs).
   Enregistrer.

3. **Déployer → Nouveau déploiement** :
   - Type : **Application Web**
   - Exécuter en tant que : **Moi** (le propriétaire du Sheet)
   - Qui a accès : **Tout le monde**
   - Autoriser les permissions demandées (le script n'accède qu'à ce Sheet).

4. Copier l'**URL de l'application Web** obtenue
   (`https://script.google.com/macros/s/…/exec`).

5. Dans [`main.js`](main.js), coller cette URL dans la constante
   `SHEETS_ENDPOINT` (en haut de la section « FORMULAIRE RSVP »).

## Comportement côté site

- Le message « Merci infiniment » ne s'affiche **que si le script confirme**
  l'enregistrement (`{ok: true}`). Sinon, un message d'erreur s'affiche et
  l'invité peut réessayer — aucune réponse ne peut se perdre en silence.
- Tant que `SHEETS_ENDPOINT` est vide (pas encore configuré), tout envoi
  affiche l'erreur : impossible de croire à tort que ça fonctionne.

## En cas de modification du script

Après toute modification dans Apps Script, il faut **redéployer**
(Déployer → Gérer les déploiements → ✏️ → Nouvelle version), sinon
l'ancienne version reste en ligne.
