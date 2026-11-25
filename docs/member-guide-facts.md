# Facts for the installation guide

Source material for writing `docs/install-fi.md` and `docs/install-en.md` (clear language, for
non-technical users of all ages). These are the facts, not the finished text. Wording in
quotes is what users see on screen (Android 17 emulator and the app in English); it can differ
slightly between phone makers and versions.

## The app

- Name: **Throttle**. Icon: a train under an overhead line, with a red signal.
- Drives trains on a layout through its Roco Z21 central unit, over the layout's Wi-Fi.
- No account, no internet needed. Everything (the vehicle library, photos, settings) is stored
  only on the phone.

## Android

### Installing (first time)

1. On the phone, open the release page on GitHub (link to be added) and tap the file
   `throttle-<version>.apk` to download it.
2. Open the downloaded file (from the browser's download notice, or the Files app → Downloads).
3. Android blocks apps from outside the Play Store at first. It shows a notice that the browser
   (or Files) is not allowed to install apps. Tap **"Settings"**, switch on **"Allow from this
   source"**, and go back.
4. Tap **"Install"**. Google Play Protect may warn that the app is unknown or not checked.
   Choose **"More details" → "Install anyway"** (wording varies). This is expected for apps that
   are not in the Play Store.
5. Open Throttle.

### Permissions (in the order users meet them)

- **First start, Android 17 and newer:** "Allow Throttle to find, connect to, and determine the
  relative position of nearby devices?" → **"Allow"**. Needed to reach the central unit on the
  Wi-Fi. Older Android versions do not ask.
  - If "Don't allow" was chosen, the app shows a dark banner: "Throttle may not use the local
    network, …" with an **"Open settings"** button. There: **Permissions → Nearby devices →
    Allow**, then go back to the app; it connects by itself.
  - Android removes permissions from apps that are not used for a few months ("Manage app if
    unused"). The app then simply asks again at the next start.
- **Taking a loco photo:** the camera permission is asked the first time "Take photo" is used.
  Choosing a photo from the gallery needs no permission.

### Updating

- Download the new APK from the release page and install it the same way. It installs over the
  old version; the vehicle library and settings are kept.
- Do not uninstall first: that deletes the library.

## iPhone and iPad

- Through **TestFlight** (Apple's test app; a user gets an invitation e-mail or a
  public link, installs "TestFlight" from the App Store, then installs Throttle from it).
- Or through an **App Store link** (unlisted: the app cannot be found by searching, only with
  the link).
- **First start:** iOS asks: "'Throttle' would like to find and connect to devices on your local
  network" → **"Allow"**. Without it the app cannot reach the central unit, and iOS does not
  show an error.
  - Fix if it was refused: **Settings → Privacy & Security → Local Network → Throttle** (switch
    on).
- The camera and photo permissions are asked when first taking or choosing a loco photo.

## Connecting to the layout

1. Connect the phone to the **layout's Wi-Fi** (network name and password from the layout's owner).
2. The layout Wi-Fi may have no internet. The phone may say "No internet" or offer to switch to
   mobile data or another network. Choose to **stay connected** to the layout Wi-Fi.
3. Open Throttle. The top right corner shows the connection: **"Online"** (green) when
   connected, **"Weak"** (yellow) when connected but replies are missing (driving still works;
   lost commands are repeated), **"Wait"** while connecting, **"Offline"** (red) when not
   connected. The controls lock only after 20 s without any reply.
4. If it does not connect: tap the connection status (or Menu → **Settings**), check the **IP
   address** of the central unit (Roco's default is `192.168.0.111`; the layout may use another),
   and tap **"Connect"**. Settings also shows which central unit and firmware were found.

## Driving (short overview, if useful for the guide)

- Menu → **"Drive"**. The left side has the function buttons (pages C I, C II, C III), the right
  side the speed slider, the direction arrows either side of the loco photo (the highlighted
  arrow is the current direction; there is no "Forward"/"Reverse" text), and the loco's own
  **STOP**. After a loco STOP the speed shows 0.
- A loco driven by address only ("Drive by address" in Vehicles): tapping the address under the
  photo opens a window to drive another address.
- The red **STOP** in the middle of the header stops **all** trains by switching the track
  power off (default, as in Roco's Z21 app). Settings → "STOP button" offers instead: emergency
  stop with double tap = power off (within about half a second), or emergency stop only. While stopped, a coloured
  chip takes STOP's place: **"STOPPED"** (yellow), **"OFF"** (blue) or **"SHORT"** (red).
  To continue: **tap the chip** (one tap, no confirmation). Locos continue at their speeds.
  Programming mode shows **"PROG"** beside the connection status instead (not tappable).
- Choose a loco: the grid button at the bottom left opens the vehicle list. The strip at the
  bottom shows every vehicle in list order (default), or recently driven locos (Settings →
  "Vehicle bar on the drive screen").
- **Drive mode** (Settings): **"Speed slider"** (default; the slider sets the speed) or
  **"Power handle"** (middle = coast, up = accelerate, down = brake, proportionally; the text
  under the speed says "Power 40 %", "Coasting", "Stopped" or "Brake 60 %"). Each loco's rates are
  **"Acceleration (km/h per second)"** and **"Braking (km/h per second)"** in the loco editor,
  default 5 each. Locos without library entry use 5 km/h/s for both and a 100 km/h top speed. After any STOP the handle
  returns to the middle.
- **Language** (Settings): "Phone language (…)", "English" or "Suomi". Phone languages
  without a translation fall back to English.
- New locos get functions F0–F12 laid out row by row: F0 left, F1 right, F2 left on the next row,
  and so on.

## Importing locos from the Roco Z21 app

1. In the Roco Z21 app, export the layout and **share/save the `.z21` file** to the phone (on
   iPhone e.g. "Save to Files"; Android: path not confirmed).
2. In Throttle: Menu → **"Vehicles"** → **"Import from Roco app"** → **"Choose export file"**,
   and pick the file.
3. The app shows how many locos and consists it found. If a loco's address is already in the
   library, choose **"Skip"**, **"Replace"** or **"Keep both"** (for each loco, or for all).
4. Tap **"Import"**. With many photos this takes about a minute. A summary shows what was
   imported and anything that could not be.
5. Speed steps are not in the Roco export; imported locos get 128 steps (can be changed per loco
   in Vehicles).

## Troubleshooting

| Problem                                                        | What to do                                                                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| "Offline" or "Wait" all the time                               | Is the phone on the layout Wi-Fi (not mobile data, not the home Wi-Fi)? Is the central unit switched on? Is the IP address in Settings right? |
| Dark banner "Throttle may not use the local network" (Android) | Tap "Open settings" → Permissions → Nearby devices → Allow.                                                                                   |
| Nothing connects on iPhone, no error                           | Settings → Privacy & Security → Local Network → Throttle on.                                                                                  |
| Banner "This z21 start is locked"                              | The z21 start needs Roco's Z21 WLAN unlock code for driving from apps; ask the layout's owner.                                                |
| Red "SHORT" chip in the header                                 | A train or wagon is causing a short on the track. Remove the cause, then tap the chip to switch the power back on.                            |
| "Also driven elsewhere" shown on a loco                        | Someone else is driving the same loco. This is allowed; the screen shows their changes too.                                                   |
| The import says the file cannot be read                        | Choose the `.z21` file exported from the Roco Z21 app, not another file.                                                                      |
| Problem not listed                                             | Report it on GitHub Issues (link to be added), with the phone model and what happened.                                                        |
