# TokenGuard Frontends

This repo is now split into two separate web frontends based on the workflow spec:

Current layout:

- `website` - marketing/acquisition website flow
- `dashboard` - product dashboard flow (still web-based for now)
- `daemon` - local server for connecting with AI IDEs

# How to run in terminal (for developer) 

### Dashboard

```bash
cd dashboard
npm install   # first time only
npm run dev
```

### Website

```bash
cd website
npm install   # first time only
npm run dev
```

### Daemon

```bash
cd daemon
npm install   # first time only
npm run start
```

## Firebase Integration Setup

To fully enable authentication and guardrail preference synchronization, you need to configure a Firebase project.

### 1. Firebase Console Configuration
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `TokenGuard` (or use an existing one).
3. Navigate to **Authentication**:
   - Enable the **Email/Password** sign-in method.
   - Enable the **Google** sign-in method.
4. Navigate to **Firestore Database**:
   - Create a database.
   - Start in **Test Mode** (or define secure read/write rules allowing access only to authenticated users matching their `userId` document ID).
5. Register a **Web App** in your project settings to obtain the client configuration parameters.

### 2. Environment Variables Configuration
In both the `website` and `dashboard` directories, copy `.env.example` to `.env.local`:

```bash
cp website/.env.example website/.env.local
cp dashboard/.env.example dashboard/.env.local
```

Populate the following variables with the credentials from your Firebase web app configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

