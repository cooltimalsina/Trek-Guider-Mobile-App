# Trek Guider — mobile app (Expo)

Production-oriented **MVP** for **tourists** and **guides**: Cognito-backed login, Trek Guider API Gateway, bookings dashboards, and **website handoff** for booking, onboarding, and advanced flows.

## Quick start

```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL (API Gateway, no trailing slash) and EXPO_PUBLIC_WEB_BASE_URL

npm install
npx expo start
```

Auth matches the website: **`POST /auth/login`** and **`POST /auth/register`** with **`intent: "tourist"` | `"guide"`** — no user pool id in the app. See `docs/ENVIRONMENT_SETUP.md`.

Press `i` / `a` for iOS simulator or Android emulator.

## Tech stack

- Expo SDK 52, React Native 0.76, TypeScript  
- Expo Router (file routes under `app/`)  
- Secure token storage: `expo-secure-store`  
- HTTP client: `src/api/client.ts` (Bearer auth, `{ data }` unwrap, 401 → logout)  
- Forgot password opens **`/login`** on the website (same pattern as the web app; no pool id in the mobile client).  

## Project layout

| Path | Role |
|------|------|
| `app/` | Screens & navigation (auth, tourist, guide) |
| `src/api/` | API modules + shared `client` |
| `src/auth/` | `AuthProvider`, SecureStore session, API Gateway login/register |
| `src/components/` | Reusable UI (buttons, cards, states) |
| `src/constants/` | `apiRoutes`, `env` |
| `src/types/` | User, booking, auth, API types |
| `docs/` | Implementation notes, env, QA, iOS/Android deploy |

## Backend endpoints used

The mobile app targets the **existing** HTTP API (no `/mobile/*` prefix in the current backend):

- `POST /auth/login` — `{ email, password, intent: "tourist" \| "guide" }`  
- `POST /auth/register` — same `intent` model; body fields match your API (e.g. name)  
- `GET /bookings/me`, `GET /bookings/{id}` — tourist  
- `GET /guides/bookings` — guide (`{ open, assigned }`)  
- `GET /guides/profile`, `POST /me/guide-onboarding/start` — guide lifecycle  
- `GET /me/tourist-profile` — tourist  
- `GET /treks/{id}` — public trek metadata for titles/images  

## EAS Build

```bash
npm i -g eas-cli
eas login
eas init
eas build --profile preview --platform all
```

Profiles: `development`, `preview`, `production` (`eas.json`). Update `ios.bundleIdentifier` and `android.package` in `app.config.ts` before stores.

## Documentation

- [Environment](docs/ENVIRONMENT_SETUP.md)  
- [Implementation details](docs/MOBILE_APP_IMPLEMENTATION.md)  
- [QA checklist](docs/QA_CHECKLIST.md)  
- [iOS deploy](docs/DEPLOY_IOS.md)  
- [Android deploy](docs/DEPLOY_ANDROID.md)  

## Claude design HTML

The hosted Anthropic design export was not retrievable from this environment. The UI is implemented to match the written spec (light theme, rounded cards, teal accent). Export `Mobile App.html` locally and align `src/theme/colors.ts` + components if you need pixel parity.

## Scripts

- `npm start` — Expo dev server  
- `npm run typecheck` — `tsc --noEmit`  
