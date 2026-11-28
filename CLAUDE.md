# CLAUDE.md

Mobile app (Expo / React Native / TypeScript) that replaces Roco's Z21 app for driving model
trains. It talks **directly** to the central unit (Roco Z21/z21/z21 start, DigiKeijs DR5000) over
UDP using the Z21 LAN protocol. There is no server, backend, accounts or analytics.

- Requirements: `CLAUDE_CODE_PROMPT.md` (the project brief).
- Protocol: `docs/reference/z21-lan-protokoll-en_1.13.pdf` is the source of truth;
  `docs/reference/z21-protocol-notes.md` is a navigation aid with byte layouts, page references and
  known ambiguities.
- If the spec is ambiguous, or hardware behaves differently from it, tell the user; do not silently
  work around it.

## Status

| Phase | Content | State |
|---|---|---|
| 0 | Setup, theme, protocol notes | done |
| 1 | Protocol layer + tests, UDP module, connection manager | done on Android (emulator vs Z21Sim and a z21 start FW 1.33); iOS untested |
| 2 | Throttle, track status, STOP | done on Android (emulator vs Z21Sim and a z21 start FW 1.33, including a real short circuit); iOS untested |
| 3 | Library, photos, loco switching | done, tested on the emulator against the z21 start |
| 4 | Split screen | done, tested on the emulator (tablet via `wm density 240`) against the z21 start |
| 5 | Consists, Roco export import | code done; consists driven on the z21 start, the user's export imported on the emulator; awaiting user review |
| 6 | Builds and docs | done; v0.1.0 released (signed APK); installation guides (`docs/install-*.md`), privacy policy and App Store drafts (`docs/app-store.md`) await user review |
| 7 | UI polish after hardware tests (0.2.x): direction arrows only, address pop-up, vehicle bar and language settings, row-by-row default functions, status in STOP's place, power-off blue, speed slider gradient, power handle drive mode with per-loco acceleration | done; 0.2.1 tested by the user on Android and an iPhone against the z21; next: production builds |

Roco app screenshots (`docs/reference/*_phone.PNG`, `*_tablet.PNG`), the spec PDF, a Roco export
(`docs/reference/z21_layout_import.z21`) and `CLAUDE_CODE_PROMPT.md` exist only locally and are
gitignored (decided by the user); never commit them. Tests that need the export skip themselves
when it is missing. Follow the screenshots for layout and flow, without Roco's branding,
icons or photos. DR5000 docs and dummy-server notes have not been provided.
**Do not invent UI layouts or the export format.** Inspect the export before writing the importer.
Screenshot notes from the user: the − / + beside STOP in `driving_demo_loco_phone.PNG` step the
**address** of a loco that is not in the library (they are not speed controls, so the throttle
has none).

Target central units were assumed to run the latest firmware, but the user's z21 start
(hardware 0x204, serial 148565, unlocked, factory IP 192.168.0.111) runs **FW 1.33**.
So the fallbacks are the live path there: no LAN_X_SET_LOCO_E_STOP (the drive E-Stop is used), no F29–F31. Keep every feature that needs FW > 1.33 behind a version check.
To reach it, the PC needs a second address in 192.168.0.x on its Ethernet adapter (e.g.
192.168.0.50; added and removed by the user as administrator).

Branches: `release` is the main branch, and changes are committed **directly to `release`**
(decided by the user). The old `feat/phase-N-…` branches are history. The user does all pushing.

Phase 6 decisions (user):
- App name **Throttle**; bundle ID / package **`fi.alppirautatiet.throttle`** (replace the
  placeholders `AR Z21` / `com.example.arz21` in `app.json`). Licence **MIT**.
- Icons: the user's set (Claude Design) in `docs/reference/files.zip` (icon.png, Android
  adaptive layers, favicon, logo.svg); copy into `assets/`.
- Versions 0.x while in development. Android: signed APK, built and uploaded to GitHub Releases
  **by hand**; the user creates and backs up the keystore (give the command and backup advice).
- iOS: builds go through EAS with a paid Apple Developer membership (needed for **any** install
  on a real iPhone). The user tests on their own iPhone before any App Store step.
- Installation guides: the user writes them with Claude; provide a factual fact sheet (Android
  APK install/update, iOS TestFlight/App Store, permissions, IP, Roco import, troubleshooting).
  No screenshots. Support via GitHub Issues.
- Android 17 (SDK 37): `ACCESS_LOCAL_NETWORK` is a runtime permission, needed to reach the
  central unit. React Native only declares it for debug builds; `modules/z21-udp` declares it and
  `src/ui/localNetworkPermission.ts` requests it at start-up. The emulator does not exercise it
  (it reaches the LAN through the host).
- Release signing: `plugins/withReleaseSigning.js`, key from Gradle properties
  (`THROTTLE_KEYSTORE_*`); steps in `docs/development.md`.
- Not wanted: "Open with / Share to" for .z21 (import from local files is enough), DR5000 in the
  README. The protocol log stays visible in Settings.

## Commands

```sh
npm run lint        # ESLint (flat config) + Prettier as warnings
npm run typecheck   # tsc --noEmit (strict)
npm test            # Jest (from Phase 1)
npx expo run:android   # dev build on emulator/device (needs Android SDK)
npx expo start --dev-client
```

Expo Go **cannot** be used, because UDP needs a native module. Use development builds.
Development happens on Windows. iOS builds go through EAS Build (cloud), so no Mac is needed.
For the Android emulator, the host PC (dummy Z21 server) is `10.0.2.2`.

## Architecture (keep the layers separate)

```
app/                    Expo Router routes (entry: expo-router/entry): thin, they render
                        screens from src/ui. _layout.tsx mounts AppServicesProvider.
modules/z21-udp/        local Expo Module: UDP socket (Kotlin DatagramSocket / Swift NWConnection)
src/
  protocol/             PURE TypeScript. No React / React Native imports. Encode/decode datasets.
  connection/           ConnectionManager: one socket, connect/status checks/reconnect/logoff,
                        subscription set (max 16), 100 ms throttle, typed events.
                        Depends on a UdpTransport interface, so tests use a fake.
  driving/              Global STOP taps, pending-change reconciliation, shared-control
                        detection (pure, tested) and DriveController, which every throttle
                        action goes through. powerHandle.ts: the "power handle" drive mode
                        (Settings → Drive mode; default is the plain speed slider). Centre =
                        coast, up = power, down = brake, at the lead loco's `acceleration` /
                        `braking` (km/h per s, default 5 each), 0…top speed.
                        A 100 ms timer runs only while the handle is off centre and sends a
                        step only when it changes; a stop reached by braking is held at 0
                        (sent again while the unit reports more), and another controller's
                        speed is taken over; the handle returns to coast on any stop,
                        track status change, disconnect or loco STOP.
  consist/              PURE consist math: speed per member (128-step scale, converted per
                        member, offset in its own steps), direction, safety rules.
                        speedMatch.ts: speed matching from each loco's time capture (Traction
                        tab, seconds over a fixed stretch at a step, as in Roco's app): a
                        member runs at the step closest to the lead's measured speed, the
                        offset adds on top; without measurements, plain scaling. Functions
                        are set per loco in the consist, with no mirroring or routing (decided
                        by the user): the member strip picks whose functions are shown.
                        Roco exports are shared from the Roco app through the iOS share sheet;
                        the Android path is not known.
  store/                Zustand stores: connection, track status, live loco state, library, settings
  library/              Loco model, function slots (pages of 2x6, column by column, as the
                        Roco export), icons, validation, speed display (pure, tested);
                        LibraryService (save/duplicate/delete/order); photos.ts (native)
  db/                   expo-sqlite schema, migrations (PRAGMA user_version), repositories.
                        Tests run the real SQL on node:sqlite (db/testUtils/nodeSqlite.ts).
  import/               Roco Z21 export importer: rocoExport.ts reads the database (pure,
                        tested against the user's export when present), importPlan.ts and
                        applyImport.ts, openRocoExport.ts (native: picker, fflate, photos)
  ui/screens, ui/components
  theme/                palette.ts, colors.ts (semantic light/dark), tokens.ts, useTheme()
  strings.ts            ALL user-visible text. English is the reference; translations are
                        `Strings` objects in LANGUAGES. Settings → Language: phone language
                        (default) or a fixed one; unsupported → English.
```

Entry points:
- `src/connection/ConnectionManager.ts`: the whole connection lifecycle.
- `src/connection/nativeUdpTransport.ts`: the only file importing the native module. Keep it
  out of `src/connection/index.ts` so the rest stays testable.
- `src/connection/testUtils/`: the fake transport and the Node `dgram` transport for tests.
- `src/ui/AppServices.tsx`: creates the one ConnectionManager, DriveController and
  LibraryService, binds the stores, connects at start-up, handles background/foreground.
  `useServices()` gives access.
- `src/ui/components/ScreenFrame.tsx`: every screen's frame (header with connection indicator
  and global STOP, connection-problem banner). Track status is a fixed-size chip in the header
  (`TrackStatusChip.tsx`), so the screen never moves when it changes; one tap on it restores
  power (decided by the user).
- `src/ui/screens/DriveScreen.tsx`: one throttle, or two side by side in landscape from
  `SPLIT_MIN_WIDTH` (`src/ui/layout.ts`, 960 dp; decided by the user). Function rows are at
  most `MAX_FUNCTION_ROW_HEIGHT`; taller areas stack several function pages. `src/ui/components/Throttle.tsx` is one throttle, after
  `driving_phone.PNG` / `driving_tablet.PNG`; what each drives is `settings.throttles[i]`
  (`src/store/throttleSelection.ts`: library loco, plain address or none).
- `src/ui/screens/LibraryScreen.tsx` (`/library`, `?mode=pick` from the drive screen) and
  `LocoEditorScreen.tsx` (`/library/[id]`, `new` for a new loco).
- Roco export format and importer decisions: `docs/z21-export-format.md`.
- `src/ui/screens/ConsistEditorScreen.tsx` (`/consist/[id]`) and `ImportScreen.tsx` (`/import`).
- `src/ui/debug/ConnectionDebugScreen.tsx`: developer test screen (Settings → For developers).

This machine (the user's Windows PC) has Android Studio on `D:`, but `ANDROID_HOME`/`JAVA_HOME`
may not be set in Claude's shell; set them per command (`%LOCALAPPDATA%\Android\Sdk`,
`D:\Program Files\Android\Android Studio\jbr`). The SDK's ninja was replaced with 1.12.1 for long
paths (see `docs/development.md`). Emulator AVD: `Medium_Phone_API_37.0` (x86_64).

## Rules that matter

**Protocol and load (10 devices may share one central unit):**
- Broadcast flags: only `0x00000001`. **Never `0x00010000`.** System-state broadcasts (`0x100`) are
  optional and off by default. Re-send the flags after every (re)connect.
- Subscribe (LAN_X_GET_LOCO_INFO) only to locos shown on screen. Each consist member counts. Max 16,
  FIFO, so track the set yourself.
- Drive commands: at most one per loco per `THROTTLE_INTERVAL_MS` (100), always the latest value,
  always the final value, nothing if unchanged. Pack several datasets into one datagram per tick.
- No polling loops, with one exception (decided by the user after operation on a busy layout,
  where lost datagrams hid STOPs and short circuits): LAN_X_GET_STATUS when the track status has
  not been heard for `STATUS_CHECK_INTERVAL_MS` (3 s). It is also the keepalive.
- A weak link is not a lost connection. No reply for `WEAK_AFTER_MS` (7 s) only shows "Weak" in the
  header; the controls stay usable and everything is still sent. Only `CONNECTION_LOST_AFTER_MS`
  (20 s) of silence counts as lost: then the controls lock and the app reconnects with a new
  socket (login repeated every second, short retry delays, logoff on every abandoned socket).
- Commands that matter are confirmed, never fire-and-forget: a drive command not shown by
  LAN_X_LOCO_INFO within `DRIVE_CONFIRM_MS` is resent with LAN_X_GET_LOCO_INFO (a few times; never
  after a stop, track status change, connection change or another controller's change). STOP and
  power off are repeated until the track status confirms them, and go out on any open socket,
  also while reconnecting; power on is not repeated (only the status is asked for).
- Optional requests (HWINFO, GET_CODE, SystemState, E_STOP on old FW) must time out with a fallback
  and never block the UI.
- Displayed loco state follows LAN_X_LOCO_INFO. Optimistic UI is fine, but always reconcile.
- Functions: use LAN_X_SET_LOCO_FUNCTION with explicit on/off. Do not use FUNCTION_GROUP.
- Receive: always split a datagram into all of its datasets by DataLen.

**Safety:**
- The global STOP is always visible on driving screens. No confirmation on driving actions or STOP.
  It sits in the header, horizontally centred (decided by the user). Exception (decided by the user):
  while the track is in emergency stop, power off or short circuit, the track status takes STOP's
  place and a tap restores the track. Within the double-tap window of a STOP tap
  (`STOP_RESTORE_GUARD_MS` = `STOP_DOUBLE_TAP_WINDOW_MS`) a tap there still counts as a STOP tap
  (double tap → power off); any later tap resumes.
- Changing direction while moving sends the new direction at the current speed, without stopping
  first: DCC decoders handle the reversal (with momentum they brake, reverse, accelerate). Decided
  by the user; revisit only if hardware shows otherwise.
- Global STOP behaviour (decided by the user; configurable in settings):
  - Default: **every tap = track power off** (LAN_X_SET_TRACK_POWER_OFF), as in Roco's Z21 app.
  - Option: **one tap = emergency stop** (LAN_X_SET_STOP, track stays powered), sent immediately
    with no delay waiting for a possible second tap; **a second tap in quick succession
    additionally switches track power off**. The double-tap window is a named constant.
  - Option: emergency stop only.
  - Restoring power is a separate, explicit control.
- Other defaults as in Roco's Z21 app (decided by the user): drive mode speed slider, vehicle bar
  "All vehicles". Changed defaults apply to new installs; saved settings are kept.
- The loco's own STOP sends the drive command with the E-Stop speed value, plus
  LAN_X_SET_LOCO_E_STOP on FW 1.43+, in one datagram (decided by the user: Z21Sim ignores
  LAN_X_SET_LOCO_E_STOP, so it is never sent alone).
- Resume / Track power on leaves loco speeds unchanged (decided by the user). Verified on the
  z21 start (FW 1.33) and Z21Sim: speeds survive STOP and power off, so locos continue where
  they were stopped. The throttle shows that speed during the stop.
- Displayed loco state must never claim something the central unit has not confirmed: pending
  changes expire after `LOCAL_CHANGE_HOLD_MS`, and the app re-requests loco info after track
  status changes and per-loco stops.
- Consist offsets never move a loco at speed 0, never reverse it, and are clamped to 0…max.
  E-stop/STOP ignore offsets.

**Code:**
- TypeScript strict. Readable and conventional over clever. Avoid new dependencies unless needed.
- Colours only via `useTheme()` semantic tokens. Lint fails on colour literals outside `src/theme/`.
  Spacing, radii, font sizes and `minTouchTarget` also come from the theme.
- Status colours are always paired with text or an icon.
- User-visible strings come from `src/strings.ts`.
- Pure logic (protocol, consist math, importer) gets Jest unit tests. Protocol tests use
  byte-exact values from the spec.
- Prettier: single quotes, semicolons, `bracketSpacing: false`, 2 spaces, LF line endings
  (enforced by `.gitattributes`). ESLint `import/order` with no blank lines between groups.
- Accessibility: large touch targets, respect system font size (do not disable font scaling).
  Dark and light mode, portrait and landscape.

**Git:** small logical commits, directly on `release` (see Branches). Do not push or
open PRs unless asked. Never commit keystores or signing keys (`*.jks`, `*.p12`, … are
gitignored).

## Libraries

These are planned, pending approval; each is installed in the phase that needs it.

- Expo SDK 58 / RN 0.88 (New Architecture only), expo-dev-client.
- Navigation: Expo Router.
- State: Zustand.
- Storage: expo-sqlite (plain SQL, no ORM) and expo-file-system (photos).
- Photos: expo-image-picker and expo-image-manipulator (resize before storing).
- Import: expo-document-picker and fflate (unzip).
- Driving UX: expo-keep-awake and expo-haptics.
- Icons: @expo/vector-icons (MaterialCommunityIcons). No Roco assets.
- Tests: Jest via jest-expo.
- UDP: our own Expo Module in `modules/z21-udp`. `react-native-udp` was rejected: no commits since
  2023 and no New Architecture support.
