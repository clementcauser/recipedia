# Parcours Utilisateurs - Authentication & Sécurité (Recipedia)

Ce document illustre les différents parcours utilisateurs (workflows) implémentés dans l'application avec BetterAuth.

## 1. Inscription & Vérification d'E-mail

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant App as Frontend (Next.js)
    participant Auth as Serveur (BetterAuth)
    participant Email as Fournisseur Email (Resend/Console)

    User->>App: Remplit le formulaire (/register)
    App->>Auth: Server Action `registerAction`
    Auth->>Email: Déclenche `sendVerificationEmail`
    Auth-->>App: Succès (Redirection)
    App-->>User: Redirige vers `/verify-email`
    Email-->>User: Reçoit le lien de vérification par email
    User->>Auth: Clique sur le lien depuis l'email
    Auth-->>User: Vérifie l'email & connecte l'utilisateur (Auto-Sign-In)
    User->>App: Accès à l'application
```

## 2. Connexion & Challenge 2FA

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant App as Frontend (Next.js)
    participant Auth as Serveur (BetterAuth)

    User->>App: Saisit ses identifiants (/login)
    App->>Auth: Server Action `loginAction`
    
    alt Compte non vérifié
        Auth-->>App: Erreur `requires_email_verification`
        App-->>User: Redirige vers `/verify-email`
    else 2FA Activée
        Auth-->>App: Erreur `requires_two_factor`
        App-->>User: Redirige vers `/two-factor`
        User->>App: Saisit le code à 6 chiffres
        App->>Auth: Server Action `twoFactorAction`
        Auth-->>App: Code valide (Session créée)
        App-->>User: Redirige vers l'accueil (`/`)
    else Authentification Classique (Sans 2FA)
        Auth-->>App: Succès (Session créée)
        App-->>User: Redirige vers l'accueil (`/`)
    end
```

## 3. Configuration de l'Authentification à Deux Facteurs (2FA)

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant App as Frontend (Settings)
    participant Auth as Serveur (BetterAuth)

    User->>App: Se rend sur `/settings/security`
    App->>Auth: Vérifie la session via Middleware
    Auth-->>App: Renvoie les données utilisateur
    User->>App: Clique sur "Activer l'A2F" avec son mot de passe
    App->>Auth: Appel API `authClient.twoFactor.enable`
    Auth-->>App: Retourne l'URI TOTP & Codes de secours
    App-->>User: Affiche le QR Code (qrcode.react) & Codes
    User->>App: Scanne le QR Code (Google Auth, Authy, etc.)
    User->>App: Sauvegarde ses codes de secours
    User->>App: Clique sur "Terminé" (Rechargement)
```

## 4. Oubli et Réinitialisation de Mot de Passe

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant App as Frontend (Next.js)
    participant Auth as Serveur (BetterAuth)
    participant Email as Fournisseur Email (Resend)

    User->>App: Clique sur "Mot de passe oublié" (/login)
    App-->>User: Affiche `/forgot-password`
    User->>App: Saisit son adresse e-mail
    App->>Auth: Appel API `authClient.forgetPassword`
    Auth->>Email: Déclenche `sendResetPassword`
    App-->>User: Affiche message de confirmation
    Email-->>User: Reçoit le lien (avec token) par email
    User->>App: Clique sur le lien (redirection `/reset-password?token=...`)
    User->>App: Saisit et confirme le nouveau mot de passe
    App->>Auth: Appel API `authClient.resetPassword`
    Auth-->>App: Succès de réinitialisation
    App-->>User: Redirige vers `/login` avec succès
```
