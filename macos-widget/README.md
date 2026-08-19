# Second Brain OS — macOS Widgets

Real Notification Center / desktop widgets showing **Today's Tasks**, **Today's
Workout**, and **Today's Meals**, built with WidgetKit. These are a separate,
tiny native app from the Electron dashboard — widgets always need a small host
app to be installed under, but this one only exists to carry the widgets. It
reads a JSON snapshot that the Electron app writes to disk whenever your data
changes, so **keep the Second Brain OS app open** (or open it periodically) to
keep the widgets fresh.

This folder contains the Swift source only — you build it yourself in Xcode
(free with any Apple ID, no $99/year developer account needed for personal
use). It hasn't been compiled or tested here since this session has no Mac or
Xcode; treat it as a strong starting point rather than a guaranteed drop-in.

## 1. Create the host app project

1. Open **Xcode** → **File → New → Project…**
2. Choose **macOS → App**, click Next.
3. Product Name: `SecondBrainWidgetsHost`. Interface: **SwiftUI**. Language: **Swift**.
4. Save it anywhere (e.g. next to this repo, or inside this `macos-widget/` folder).
5. In the generated project, delete the default `ContentView.swift` and the
   `SecondBrainWidgetsHostApp.swift` Xcode created, and drag in the file from
   this folder: `SecondBrainWidgetsHost/SecondBrainWidgetsHostApp.swift`.

## 2. Add the widget extension

1. **File → New → Target…**
2. Choose **Widget Extension**, click Next.
3. Product Name: `SecondBrainWidgets`. Uncheck **"Include Live Activity"**.
   Uncheck **"Include Configuration App Intent"** (these widgets are static,
   not user-configurable).
4. Xcode creates a new group with a boilerplate Swift file — delete it.
5. Drag in both files from this folder's `SecondBrainWidgets/` directory:
   - `WidgetData.swift`
   - `SecondBrainWidgets.swift`
   Make sure both are added to the **SecondBrainWidgets** target (checkbox in
   the file inspector on the right).

## 3. Turn off App Sandbox on both targets

The widget reads a plain file path outside any sandbox container, so Sandbox
needs to be off for both targets (fine for a personal, non–App-Store app):

1. Select the project in the navigator → select the **SecondBrainWidgetsHost**
   target → **Signing & Capabilities** tab.
2. If there's an **App Sandbox** capability listed, click the `×` to remove it.
   Set **Team** to your personal Apple ID.
3. Repeat for the **SecondBrainWidgets** (extension) target.
4. For both targets, set **Minimum Deployments → macOS** to **14.0** (General
   tab) — the widget code uses `.containerBackground`, which needs macOS 14+.

## 4. Build and install

1. Select the **SecondBrainWidgetsHost** scheme (not the widget extension) at
   the top of the Xcode window.
2. Press **⌘R** to build and run. A small window titled "Second Brain
   Widgets" should appear — that means it installed successfully. You can
   quit it; it doesn't need to stay open.
3. Click the date/time in the menu bar to open Notification Center, scroll to
   the bottom, click **Edit Widgets**, find **Second Brain Widgets** in the
   list, and drag in **Today's Tasks**, **Today's Workout**, and/or **Today's
   Meals**.

## 5. Keep the data fresh

The Electron app writes `~/Library/Application Support/SecondBrainOS/widget-data.json`
about 800ms after any change to tasks, your gym plan, or your diet plan, but
only while it's running. Widgets refresh on their own roughly every 15
minutes, so:
- Keep Second Brain OS open (or open it once in a while) to update the file.
- If a widget shows nothing, open Second Brain OS at least once so it writes
  the initial file.

## Spotify widget setup (in-app, no Xcode needed)

The Spotify widget lives on the **Widgets** page inside Second Brain OS
itself (not one of the Notification Center widgets above) and lets you see
and control what's playing. It needs a free Spotify Developer app to talk to
Spotify's API on your behalf:

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   and log in with your Spotify account.
2. Click **Create app**. Name it anything (e.g. "Second Brain OS"). App
   description can be anything too.
3. **Redirect URI**: enter exactly `http://127.0.0.1:17654/callback` and
   click **Add**. This has to match exactly — it's the fixed local address
   the desktop app briefly listens on during login.
4. Which API/SDKs are you planning to use? Check **Web API**.
5. Save. On the app's page, click **Settings** and copy the **Client ID**
   (you don't need the Client Secret — this app uses the more secure PKCE
   flow, which doesn't need one).
6. In Second Brain OS, go to **Widgets**, paste the Client ID into the
   Spotify card, and click **Connect Spotify**. Your browser opens Spotify's
   login/consent page; after approving, you'll see a "Spotify connected"
   page you can close, and the widget switches to showing what's playing.

Requires **Spotify Premium** — play/pause/skip control is blocked by
Spotify's API for Free accounts. The widget controls whatever device your
Spotify is actively playing on (phone, another computer, speaker) via
Spotify Connect — it doesn't play audio itself.

**Where the token is stored**: encrypted on disk (via Electron's
`safeStorage`, backed by macOS Keychain) at
`~/Library/Application Support/second-brain-os/spotify-tokens.enc`. Click
**Disconnect** in the widget to remove it.

## Troubleshooting

- **Widget shows nothing / stale data**: open the Electron app, make any
  small change (check off a task), then wait ~15s and re-check the widget
  gallery preview, or remove and re-add the widget to force a refresh.
- **Build error about `containerBackground`**: confirm both targets' minimum
  deployment is macOS 14.0+ (step 3.4 above).
- **File not found errors at runtime**: confirm the path really exists —
  `cat ~/Library/Application\ Support/SecondBrainOS/widget-data.json` in
  Terminal after opening the Electron app once.
- Tapping a widget currently tries to open a `secondbrainos://` URL, which
  the Electron app doesn't register a handler for yet — this is a no-op for
  now (a future enhancement, not required for widgets to display data).
