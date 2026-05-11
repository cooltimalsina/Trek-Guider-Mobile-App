# Deploy to Google Play

## Prerequisites

- Google Play Console developer account  
- Play app created with package name matching `app.config.ts` → `android.package` (e.g. `com.yourcompany.trekguider`)  
- Expo account, `eas-cli` installed and logged in  

## EAS setup

Same as iOS: `eas init` if not already done.

## Signing

EAS can create and store an upload keystore:

```bash
eas credentials -p android
```

## Build

**Internal APK (fast sharing):**

```bash
eas build --profile preview --platform android
```

**Play Store bundle (AAB):**

```bash
eas build --profile production --platform android
```

The production profile in this repo uses `app-bundle`.

## Play Console tracks

1. Upload the AAB to **Internal testing** first.  
2. Add testers by email list.  
3. Promote to **Closed testing** / **Open testing** as needed.  
4. **Production** release when QA passes.

## Store listing checklist

- [ ] Data safety form (API, auth, optional location if you add maps later)  
- [ ] Content rating questionnaire  
- [ ] High-res icon (512×512) and feature graphic  
- [ ] Screenshots (phone + 7" tablet if required)  
- [ ] Privacy policy URL  

## Verification

Install the internal build on a physical device, run `docs/QA_CHECKLIST.md` flows, confirm **deep links** / browser handoff for website booking.
