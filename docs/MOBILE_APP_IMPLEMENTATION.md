# Trek Guider mobile — implementation summary

## Design source

The Claude-hosted design URL (`api.anthropic.com/.../Mobile App.html`) could not be fetched from this environment (HTTP 500 / auth). The UI implemented here follows the product brief: **light background, soft cards, teal accent, generous spacing, safe areas**, aligned with common tourism-app patterns. If you export `Mobile App.html` locally, you can paste tokens (colors, radii, typography) into `src/theme/colors.ts` and shared components without changing navigation.

## Architecture

- **Expo SDK 52**, **React Native 0.76**, **TypeScript**, **Expo Router** (file-based routing).
- **State**: React context `AuthProvider` + `useAuth` (`src/auth/AuthContext.tsx`).
- **Tokens**: `expo-secure-store` (`src/auth/sessionStorage.ts`).
- **HTTP**: `src/api/client.ts` — unwraps `{ data }` responses from the Trek Guider API, attaches `Authorization` for protected calls, triggers logout on `401`.
- **Domain modules**: `authApi`, `profileApi`, `touristApi`, `guideApi` under `src/api/`.
- **Routes**: `src/constants/apiRoutes.ts` maps to the deployed API Gateway paths.

## Auth flow

1. User chooses tourist or guide on the welcome screen.
2. `POST /auth/login` with matching `intent` (selects Cognito app client on the backend).
3. Access (and optional refresh/id) tokens stored in SecureStore with intent and expiry.
4. **Tourist**: `GET /me/tourist-profile` validates access.
5. **Guide**: `POST /me/guide-onboarding/start` then `GET /guides/profile` to resolve dashboard vs onboarding states.

Refresh: `POST /auth/refresh` with stored refresh token when access token is near expiry.

Logout: `POST /auth/logout` with `{ accessToken }` (best-effort) + clear SecureStore.

Forgot password: opens the **website** (`/login` with `?role=guide` when in guide mode) — same high-level approach as the web apps; no Cognito SDK or pool id in the mobile client.

## Role routing

- **Tourist**: `app/tourist/*` — layout rejects non-tourist intent.
- **Guide**:
  - `guideStatus` / bootstrap `APPROVED` → tabs under `app/guide/(main)/*`.
  - Otherwise → `app/guide/onboarding-required.tsx` with website CTA + logout.

Routing is driven by **successful API profile/bootstrap responses**, not only client assumptions.

## API mapping (MVP)

| Feature | Endpoint |
|---------|----------|
| Login / register / refresh / logout | `/auth/*` |
| Tourist profile | `GET /me/tourist-profile` |
| Guide bootstrap | `POST /me/guide-onboarding/start` |
| Guide profile | `GET /guides/profile` |
| Tourist bookings | `GET /bookings/me`, `GET /bookings/{id}` |
| Guide bookings | `GET /guides/bookings` → `{ open, assigned }` |
| Trek metadata (images/titles) | `GET /treks/{id}` (public) |

There are **no** `/mobile/*` routes in the current backend; the app uses the existing REST surface above.

## Tourist features

- Tabbed **Home** (summary + recent bookings), **Bookings** (filters + pull-to-refresh), **Profile**.
- Booking detail with trek card, status badge, payment hints when present.
- “Book more trips” / “Open website” opens `EXPO_PUBLIC_WEB_BASE_URL` via `expo-web-browser`.

## Guide features

- Same tab structure for **approved** guides.
- Booking list merges **assigned** and **open** regional requests; detail resolves from that merged list (no dedicated `GET /guides/bookings/{id}` in API today).
- Non-approved guides see onboarding / review / rejection messaging and a **Continue on website** button (`EXPO_PUBLIC_GUIDE_ONBOARDING_URL`).

## Intentionally out of scope (MVP)

- In-app booking/checkout/payment  
- Admin / workforce login  
- Social sign-in  
- Full marketplace browsing  
- Guide onboarding forms inside the app  
- Accept/reject booking actions (backend supports some; product asked to omit unless safe — omitted)

## Future improvements

- Dedicated mobile aggregation endpoints (e.g. dashboard summary) to reduce N+1 trek fetches  
- Push notifications for booking state changes  
- Offline cache / SWR for booking lists  
- Deep links from email into a booking screen  
- Import exact typography/spacing from exported Claude HTML  
