# HealthHub

A native iPhone + Apple Watch app that logs gym sessions, tracks live workouts from your Watch, pulls in your Apple Health data (steps, heart rate, sleep, weight, workouts), and acts as a hub for fitness goals and basic nutrition logging.

Built with SwiftUI + SwiftData + HealthKit + WatchConnectivity. All data lives locally on your devices — no backend, no accounts.

## What's included

- **Dashboard** — today's steps, active energy, heart rate, sleep, weight, and weekly workout count, pulled straight from Health.
- **Workouts** — log gym sessions manually (exercises, sets, reps, weight) or start one live from your Apple Watch. Manual sessions can optionally be written back to Health.
- **Goals** — set targets (body weight, workouts/week, daily steps, active energy, protein, sleep) with progress bars computed from your logged data + Health.
- **Nutrition** — quick food/macro logging with daily totals.
- **Apple Watch app** — start a workout (strength, HIIT, running, etc.), see live heart rate/calories/duration, log sets mid-workout, end to save it to Health and sync the full session (with exercises/sets) back to the iPhone app.

## Project structure

```
project.yml                   XcodeGen spec — generates the .xcodeproj (not committed)
App/
  Shared/                     Code used by both targets: SwiftData models, HealthKitManager,
                               goal progress calculator, exercise/activity catalog, sync payloads
  HealthHub/                  iOS app (SwiftUI views, WatchConnectivity receiver)
  HealthHubWatch/              watchOS companion app (live workout session, set logging)
```

## Requirements

- A Mac with Xcode 15+ installed
- An iPhone and (optionally, for the live-workout features) a paired Apple Watch — **HealthKit does not return real data in the Simulator**, so Health-backed features need a physical iPhone
- [XcodeGen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`

This repo does not include a `.xcodeproj` — it's generated from `project.yml` so the project stays diffable and merge-friendly. You regenerate it locally.

## Setup

1. Clone the repo and `cd` into it.
2. Generate the Xcode project:
   ```bash
   xcodegen generate
   ```
   This creates `HealthHub.xcodeproj` and generates each target's `Info.plist` / entitlements from `project.yml`.
3. `open HealthHub.xcodeproj`
4. In Xcode, select the **HealthHub** target → *Signing & Capabilities* → set your Team (a free personal Apple ID works for installing on your own device). Repeat for the **HealthHubWatch** target.
   - If the default bundle IDs (`com.avisohi.healthhub` / `com.avisohi.healthhub.watchkitapp`) collide with something already provisioned on your account, edit the `PRODUCT_BUNDLE_IDENTIFIER` values in `project.yml` and re-run `xcodegen generate`.
5. Plug in your iPhone (with your Watch paired to it), choose it as the run destination, select the **HealthHub** scheme, and hit Run. Xcode installs both the iPhone app and the Watch app automatically.
6. On first launch, approve the Health permissions prompt on both the iPhone and the Watch.

## Using it

- Log a workout manually from the **Workouts** tab, or start one on your Watch (open HealthHub on the Watch → pick an activity → Start). During a live workout, tap **Log Set** to record an exercise/reps/weight; when you tap **End Workout** it saves to Health and syncs the full session to your iPhone.
- Add goals from the **Goals** tab — progress bars update from Health data and your logged sessions automatically.
- Log food in **Nutrition** for a running daily macro total.

## Notes / known limitations

- This was written without access to Xcode/macOS, so it hasn't been compiled — if you hit a build error when you first open it, it's most likely a small API/availability mismatch; happy to fix once you share the error.
- No app icon image is included (just an empty slot) — add one before archiving for TestFlight/App Store; not required for running on your own device.
- Ideas for next iterations: trend charts (Swift Charts) on the Dashboard, background HealthKit delivery so stats update without opening the app, custom exercise catalog editing, Live Activities / widgets, iCloud sync via SwiftData's CloudKit support if you want it across multiple devices.
