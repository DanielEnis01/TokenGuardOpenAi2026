# TokenGuard Dashboard

## Firebase Authentication setup

1. Create or select a project in the [Firebase console](https://console.firebase.google.com/).
2. Add a **Web app** to the Firebase project and copy its configuration values.
3. Open **Authentication** → **Sign-in method**, then enable **Email/Password** and **Google**.
4. Copy `.env.example` to `.env.local` and fill in every `VITE_FIREBASE_*` value from the Firebase web app configuration.
5. In Firebase Authentication, add each deployed website domain to **Settings** → **Authorized domains**. `localhost` is available for local development.

Firebase web configuration is intended for browser clients, but Firebase security rules and Authentication settings must still protect your data. Do not put an Admin SDK service-account key in this dashboard.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` to verify the production dashboard build.
