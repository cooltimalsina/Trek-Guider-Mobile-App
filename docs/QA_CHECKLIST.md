# QA checklist — Trek Guider mobile MVP

## Auth

- [ ] Tourist sign up (verify email flow if pool requires confirmation)
- [ ] Tourist sign in → lands on tourist tabs
- [ ] Tourist sign in with wrong password → error message
- [ ] Guide sign up → message / next steps
- [ ] Guide sign in → approved guide sees tabs; non-approved sees onboarding website screen
- [ ] Forgot password link opens website login
- [ ] Logout clears session and returns to welcome

## Tourist

- [ ] Dashboard loads summary counts and recent bookings (or empty state)
- [ ] Pull to refresh on dashboard
- [ ] Bookings tab filters (All, Upcoming, Current, etc.)
- [ ] Booking detail shows trek info when `GET /treks/:id` succeeds
- [ ] “Open full website” opens browser
- [ ] Profile shows user fields

## Guide (approved)

- [ ] Dashboard loads merged open + assigned bookings
- [ ] Bookings tab + filters
- [ ] Booking detail opens for known id
- [ ] Profile shows guide status

## Guide (not approved)

- [ ] Onboarding-required screen copy matches state (onboarding vs pending review vs rejected)
- [ ] “Continue on website” opens configured URL
- [ ] Logout works from this screen

## Security / routing

- [ ] No admin routes exposed in navigation
- [ ] 401 from API triggers logout / session cleared
- [ ] Tourist cannot open guide tabs without guide intent (layout redirect)
- [ ] Guide cannot open tourist tabs without tourist intent

## Devices

- [ ] iPhone — safe area (notch / island) — headers and tab bar not clipped
- [ ] Android — status bar + navigation bar insets
- [ ] Small phone — scroll on auth forms
- [ ] Keyboard does not cover primary actions on login

## Env

- [ ] Missing `EXPO_PUBLIC_API_BASE_URL` shows clear error on first API call
