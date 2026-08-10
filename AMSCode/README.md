# AMS Code — Study & Tasks Widgets

A SwiftUI iPhone app with two Home Screen widgets — **Study** and **Tasks** —
where each item has a checkbox, a tag, and a due date, all editable right on
the widget: tap the checkbox to mark it done, tap the tag or due date to pick
a new one from a dropdown, no need to open the app. The app and widgets
target iOS 17+ (needed for tappable buttons/menus inside widgets) and share
data on-device via an App Group; nothing leaves your phone.

## What's included

```
AMSCode/
  project.yml          # XcodeGen project spec (generates the .xcodeproj)
  AMSCode/              # Main app (SwiftUI, tab view: Study / Tasks)
  AMSWidgets/            # Widget extension: StudyWidget + TasksWidget
  Shared/                # Model, on-device store, App Intents — used by both
```

- `Shared/Item.swift` — the `Item` model (title, done flag, category, tag,
  due date, created date).
- `Shared/Tag.swift` / `TagStore.swift` — user-editable tags per category
  (defaults: Math/Science/History/... for Study, Work/Personal/... for
  Tasks), persisted the same way as items.
- `Shared/ItemStore.swift` — reads/writes items as JSON in a shared App
  Group `UserDefaults` suite, sorts by due date, and asks WidgetKit to
  reload timelines after every change.
- `Shared/ToggleItemIntent.swift` — runs when you tap a checkbox on the
  widget, toggling the item without launching the app.
- `Shared/SetItemTagIntent.swift` — runs when you pick a tag from the
  dropdown menu on a widget row.
- `Shared/SetDueDateIntent.swift` — runs when you pick a due date preset
  (Today / Tomorrow / Next Week / No Date) from the dropdown menu on a
  widget row. Widgets can't host a real calendar, so this is presets only;
  a custom date can be set from the app.
- `Shared/ChecklistRow.swift` — the per-item widget row: checkbox button
  plus, on medium/large widgets, tag and due-date dropdown menus (hidden on
  small widgets — no room).
- `AMSWidgets/StudyWidget.swift` / `TasksWidget.swift` — one widget per
  category, each independently addable to the Home Screen, with small /
  medium / large layouts.
- `AMSCode/` — the app itself: `Study` and `Tasks` tabs, add/edit (title,
  tag, due date)/check off/swipe-to-delete, plus a "Manage Tags" screen
  (tag icon in the toolbar) to add/rename/delete tags per category.

## One-time setup (on a Mac, in Xcode)

This was built in a Linux container, so it hasn't been compiled — you'll
generate and open the Xcode project on your Mac:

1. **Install XcodeGen** (generates `.xcodeproj` from `project.yml`):
   ```bash
   brew install xcodegen
   ```
2. **Pick a unique bundle ID** (Apple requires globally-unique bundle
   identifiers). Find-and-replace `com.example.amscode` throughout
   `project.yml` with your own, e.g. `com.<yourname>.amscode`. Keep the
   `AMSWidgetsExtension` target's ID as `<yours>.widgets` (must be nested
   under the app's ID), and update the App Group name
   `group.com.example.amscode` to match (App Group IDs must start with
   `group.`).
3. **Generate the Xcode project**:
   ```bash
   cd AMSCode
   xcodegen generate
   open AMSCode.xcodeproj
   ```
4. **Set your Team**: in Xcode, select the `AMSCode` project → for both the
   `AMSCode` and `AMSWidgetsExtension` targets → Signing & Capabilities →
   choose your Apple ID team. Xcode will register the App Group
   automatically (a free Apple ID account works fine for local device/
   simulator testing).
5. **Run** the `AMSCode` scheme on your iPhone or a simulator running
   iOS 17+.
6. **Add the widgets**: on the Home Screen, touch and hold an empty area →
   `+` → search "AMS Code" → add **Study Checklist** and/or **Tasks
   Checklist**, choosing whichever size you like.

## How it works

- Adding/editing/checking off an item in the app writes to the shared App
  Group store and immediately tells WidgetKit to refresh, so widgets update
  right away.
- Tapping a checkbox, or picking a tag/due-date from a dropdown, **in the
  widget** runs an `AppIntent` (`ToggleItemIntent`, `SetItemTagIntent`,
  `SetDueDateIntent`) inside the widget extension process directly — the
  change applies without opening the app, then WidgetKit reloads the
  timeline to show it.
- Widgets are read/write against the same on-device store as the app, so
  everything always stays in sync — there's no separate "widget data".
- Items are sorted with not-done first, then by due date (soonest first,
  items with no due date last), then by creation date. Overdue items show
  their due date in red, in both the app and the widgets.

## Notes / things you may want to change

- Bundle IDs and the App Group name are placeholders (`com.example.amscode`)
  — you must change them to something unique before it will build/sign.
- Data is on-device only (no iCloud sync). If you want it to sync across
  your own devices, swap `UserDefaults(suiteName:)` in `ItemStore` for an
  `NSUbiquitousKeyValueStore` or CloudKit-backed store.
- No app icon / accent color asset catalog was added — Xcode will use a
  default icon until you add one (Assets.xcassets) in the `AMSCode` target.
