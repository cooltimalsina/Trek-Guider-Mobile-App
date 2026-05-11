# Environment setup

## Variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | Single API Gateway base URL for all Trek Guider HTTP APIs. |
| `EXPO_PUBLIC_WEB_BASE_URL` | Public website used for booking, onboarding, and “open in browser” actions. |
| `EXPO_PUBLIC_GUIDE_ONBOARDING_URL` | Optional full URL for guide onboarding. If omitted, the app uses `${WEB_BASE_URL}/guide/onboarding`. |

Login and registration do **not** need Cognito env vars on the device: the API Gateway auth Lambdas use `intent` to pick the correct Cognito app client (same as the website).

## Files

1. Copy `.env.example` to `.env` in the project root.
2. Restart Expo (`npx expo start`) after changes.

Expo inlines `EXPO_PUBLIC_*` at build time. They are visible in the client bundle — **do not** place secret keys here.

## What must never go in mobile env

- AWS access keys or IAM user secrets  
- Stripe secret keys  
- Admin or workforce Cognito app client ids (this app is tourist/guide only)  
- Database credentials  

## Backend alignment

Auth uses the same routes as the web app:

- `POST /auth/login` with `{ email, password, intent: "tourist" | "guide" }`
- `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`
- Protected routes send `Authorization: Bearer <access_token>`

See `Trek-Guider-Backend/infra/cdk/lib/stacks/api-stack.ts` for the canonical route list.
