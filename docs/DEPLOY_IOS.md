# Deploy to iOS (TestFlight / App Store)

## Prerequisites

- Apple Developer Program membership  
- Machine with Xcode (for local simulator testing; EAS can build in the cloud)  
- Expo account and EAS CLI: `npm i -g eas-cli` then `eas login`  
- App Store Connect app record (bundle id must match `app.config.ts` → `ios.bundleIdentifier`)

## One-time EAS setup

1. In the repo root: `eas init` (links an EAS project and writes `extra.eas.projectId` — you may merge into `app.config.ts` or use `app.json` dynamic config).  
2. Confirm `ios.bundleIdentifier` is unique (e.g. `com.yourcompany.trekguider`).

## Configure credentials

EAS can manage certificates and provisioning profiles:

```bash
eas credentials
```

Follow prompts for App Store distribution.

## Build

**Internal / QA (simulator or ad-hoc):**

```bash
eas build --profile preview --platform ios
```

**Production (App Store):**

```bash
eas build --profile production --platform ios
```

## Submit to App Store Connect

```bash
eas submit --platform ios --latest
```

Or download the `.ipa` from the EAS build page and upload via Transporter.

## TestFlight

1. In App Store Connect, open the build → enable **TestFlight** testing.  
2. Add internal testers, then external beta if needed.  
3. Verify: install TestFlight build, complete tourist + guide smoke tests (`docs/QA_CHECKLIST.md`).

## App Store release checklist

- [ ] Privacy nutrition labels accurate (data sent to your API / Cognito)  
- [ ] Support URL and marketing URL  
- [ ] Screenshots for required device sizes  
- [ ] App Review notes: “MVP uses Safari/in-app browser for booking; no IAP”  
- [ ] Version/build numbers bumped in `app.config.ts`  
