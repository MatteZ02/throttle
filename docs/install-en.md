# Throttle: installing and getting started

Throttle is an app for driving the trains on a model railway layout from your phone or tablet.
It connects to the layout's Roco Z21 central unit over the layout's Wi-Fi.

- You do not need an account, and the app does not use the internet.
- Your locos, photos and settings are stored only on your own phone.
- Please report anything odd (see the end of this guide).

Skip to your phone type: [Android](#android) · [iPhone and iPad](#iphone-and-ipad)

## Android

Throttle is not in the Google Play Store. You download it from the project's GitHub page instead.
That is safe, but Android asks you to confirm a few times.

### Installing

1. On your phone, open this page: **<link to the releases page>**
2. Under the newest version, tap the file **`throttle-…apk`**. The phone downloads it.
3. Open the downloaded file: tap the notice that the download is finished, or open the
   **Files** app and look in **Downloads**.
4. Android says that this source is not allowed to install apps. Tap **Settings**, switch on
   **Allow from this source**, and go back.
5. Tap **Install**.
6. Google Play Protect may warn that the app is unknown. Tap **More details**, then **Install
   anyway**. (The words differ a little between phones.) This warning is normal for apps that are
   not in the Play Store.
7. Open **Throttle**.

### The first start

On Android 17 and newer, the app asks: _"Allow Throttle to find, connect to, and determine the
relative position of nearby devices?"_ Tap **Allow**. The app needs this to reach the central
unit on the Wi-Fi. Older Android versions do not ask.

If you tapped **Don't allow** by mistake, the app shows a dark banner with an **Open settings**
button. Tap it, then **Permissions → Nearby devices → Allow**, and go back to the app.

### Updating

When there is a new version, download it from the same page and install it the same way. It
installs over the old one, and your locos and settings stay.

**Do not uninstall the app before updating.** Uninstalling deletes your locos and photos.

## iPhone and iPad

Throttle is installed through **TestFlight**, Apple's app for testing new apps, or from the App
Store through a link (you cannot find it by searching).

### Installing with TestFlight

1. Open the invitation link: **<TestFlight link>**
2. If the phone does not have **TestFlight** yet, the page sends you to the App Store to get it.
   Install it, then open the link again.
3. In TestFlight, tap **Accept**, then **Install**.
4. Open **Throttle**.

TestFlight updates the app when there is a new version (or shows an **Update** button). A test
version stops working after 90 days; install a newer one from TestFlight.

### The first start

The app asks: _"'Throttle' would like to find and connect to devices on your local network."_
Tap **Allow**. Without it, the app cannot reach the central unit, and the iPhone does not tell
you why.

If you tapped **Don't Allow**: open the iPhone's **Settings → Privacy & Security → Local
Network** and switch on **Throttle**.

The app asks for the camera or your photos only when you add a photo to a loco.

## Connecting to the layout

1. Connect the phone to the **layout's Wi-Fi**. Ask the layout's owner for its name and password.
2. The layout's Wi-Fi has no internet. The phone may say **No internet** or offer to switch to
   mobile data or another network. Choose to **stay connected** to the layout's Wi-Fi.
3. Open Throttle. The top right corner shows:
   - **Online** (green): connected. You can drive.
   - **Wait**: connecting.
   - **Offline** (red): not connected.
4. If it stays **Offline**, tap the connection status (or **Menu → Settings**). Check that the
   **IP address** is the central unit's address, and tap **Connect**. Roco's default address is
   `192.168.0.111`.

## Driving

- Open **Menu → Drive**.
- The **slider** sets the speed. The **arrows** on either side of the loco photo set the
  direction: the highlighted arrow is the direction the loco runs.
- The **function buttons** (lights, sound, …) are on the left. Tap **C I, C II, C III** for
  more.
- The loco's own **STOP** stops only that loco.
- To choose another loco, tap the **grid button** at the bottom left. Locos you drove recently
  are at the bottom of the screen.
- Driving a loco by its address only (**Vehicles → Drive by address**)? Tap the address under
  the photo to change it.

### Power handle

If you prefer driving like a real train, choose **Menu → Settings → Drive mode → Power
handle**. The slider then works like a cab's power handle:

- **Middle:** coast. The train keeps its speed.
- **Up:** accelerate. The higher, the faster the train speeds up.
- **Down:** brake. The lower, the harder it brakes, down to a stop.

How quickly each loco speeds up is set with **Acceleration** in the loco's settings under
**Vehicles** (5 km/h per second unless you change it). The STOP buttons work as usual, and the
handle returns to the middle after a stop.

### The red STOP at the top

The red **STOP** in the middle of the top bar stops **all** trains on the layout, at once.

- **One tap:** all trains stop. The track stays powered.
- **Two quick taps:** all trains stop, and the **track power is switched off** too.
- While the trains are stopped, a coloured sign takes the place of STOP: **STOPPED** (yellow, all
  trains stopped), **OFF** (blue, track power off) or **SHORT** (red, short circuit). To
  continue, **tap that sign**. The trains then continue at the speeds they had.

The app never asks "are you sure?" for STOP: it acts immediately.

### Settings

Under **Menu → Settings** you can also choose what the bar at the bottom of the drive screen
shows (**Recently driven**, or **All vehicles** in the order of your vehicle list) and the
language.

## Bringing your locos from the Roco Z21 app

If you used Roco's Z21 app, you can bring your locos, photos, function buttons and consists
over.

1. In the Roco Z21 app, export your layout and save the **`.z21`** file on the phone. On an
   iPhone, choose **Save to Files**.
2. In Throttle, open **Menu → Vehicles → Import from Roco app → Choose export file**, and pick
   the file.
3. The app shows how many locos it found. If a loco with the same address is already in
   Throttle, choose **Skip**, **Replace** or **Keep both**.
4. Tap **Import**. With many photos, this can take about a minute.

The Roco export does not include speed steps, so imported locos get 128 steps. You can change
this for each loco under **Vehicles**.

## If something does not work

| What you see                                                   | What to do                                                                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline** or **Wait** all the time                           | Is the phone on the **layout's** Wi-Fi (not mobile data, not your home Wi-Fi)? Is the central unit switched on? Is the IP address in Settings right? |
| Dark banner "Throttle may not use the local network" (Android) | Tap **Open settings → Permissions → Nearby devices → Allow**.                                                                                        |
| Nothing connects on an iPhone, and there is no error           | **Settings → Privacy & Security → Local Network → Throttle** on.                                                                                     |
| Banner "This z21 start is locked"                              | The central unit must be unlocked for driving from apps. Tell the layout's owner.                                                                    |
| Red **SHORT** sign at the top                                  | Something on the track is causing a short (often a derailed wagon). Remove it, then tap the **SHORT** sign to switch the power back on.              |
| "Also driven elsewhere" on a loco                              | Someone else is driving the same loco. That is allowed; you see their changes too.                                                                   |
| The import says the file cannot be read                        | Choose the `.z21` file exported from the Roco Z21 app.                                                                                               |

Something else? Report it on **<link to GitHub Issues>**. Say what phone you
have and what happened.
