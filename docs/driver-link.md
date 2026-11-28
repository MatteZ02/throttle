# Driver link: Lever ↔ Throttle (contract)

This is the agreed design for the link between **Lever** (control station, Windows) and **Throttle** (driving app, phones). The same file lives in both repositories:
- Lever: `docs/driver-link.md`, replacing `docs/driver-interface.md`
- Throttle: `docs/driver-link.md`, replacing `docs/lever-driver-interface.md`

Keep both copies identical. Lever's copy is the master.

## 1. Goal

**For the driver**, Throttle shows what the control station knows and the central unit does not:
- the **line** the driver is on;
- how the **turnouts, signals and routes along that line** are set (this works at every level, including Levels 1–2, and without detectors);
- and, once Lever has trains with detection (Levels 3–4):
  - where the train is
  - how many blocks ahead are free
  - why Lever is holding it
  - its automatic state.

**For the operator**, Lever gets a **strip board**, similar to air traffic flight strips:
- one strip per driven loco or consist, identified by its **DCC address**;
- showing the driver, line, live speed and direction, and any conflicts.

Lever learns loco data and live state from the phones, so at Levels 1–2 it knows what each loco is doing without adding traffic to the central unit.

**Out of scope, now and for this link:** timetables and train numbers other than the DCC address.

## 2. Ground rules

1. **Each app works fully without the other.**
   - Lever works with Throttles that don't have the link (older versions, link turned off, the Roco Z21 app). Its operator can create manual strips for those drivers.
   - Throttle works with a Lever that doesn't have the link, or with no Lever at all. Nothing in driving ever waits for the link.
2. **No extra load on the central unit.** The link never causes a single extra Z21 datagram:
   - Lever never subscribes a loco or polls because of the link;
   - Throttle sends nothing new to the central unit.
3. **Local network only, opt-in on both sides.** It is off by default. There is no server, cloud, accounts or telemetry. Lever answers only configured private address ranges.
4. **Declarations, not commands.**
   - Throttle → Lever messages (loco data, live state, line choice, driver name) are declarations that Lever stores in memory and shows.
   - Nothing a phone sends makes Lever switch, drive or set anything. The one exception is safety-directed: a loco data conflict **stops** automation (section 7).
   - Driver requests (asking for a route, "ready to depart") are a later step. The protocol already has room for them (capabilities, reliable requests).
5. **Authorities:**
   - **The central unit** is the authority for physical state.
   - **Lever** is the authority for logical state (routes, trains, holds, automatic runs, strips) and for loco data: **Lever's loco list wins** (section 7).
   - **Throttle** shows Lever's view; it never computes protection.
6. **Displayed state never claims more than is known.** Positions only reported at start-up, or unknown, are shown as such. Stale link data is shown as stale, never as "all clear".
7. **Backwards and forwards compatible:**
   - project files, settings and databases (each repo's prompt has the details);
   - the protocol: major/minor versions, unknown fields and message types ignored, capabilities negotiated.
8. **Everything configurable** (section 11), with sensible defaults.
9. **Shared conventions:** TypeScript strict; strings in English and Finnish (Finnish written natively, RATO terms); status never shown by colour alone; Zod validation at every process and network boundary.

## 3. Identity

All ids are generated once, never reused, and have the format `<prefix>-<timestamp>-<random>`:
- `<timestamp>` is milliseconds since 1970, in base 36;
- `<random>` is at least 8 base-36 characters from a cryptographic random source.

| Id | Prefix | Generated | Purpose |
|---|---|---|---|
| Lever project id | `prj` | New project, **Save as**, every import that creates a project, and migration of older files (section 10) | Throttle and Lever's user data tell projects apart (not by name) |
| Lever instance id | `lvr` | Once per installation (settings) | Tells two Levers apart, even with the same project open |
| Lever session id | `ses` | Every start of the link service | Throttle knows Lever restarted and its memory was reset |
| Throttle device id | `thr` | Once per installation (settings) | Identifies the phone on strips; survives app restarts |

## 4. Transport

- **UDP, JSON in UTF-8.** Lever listens on one port, default **21110**, configurable on both sides; it is chosen away from the Z21's 21105–21107. Lever replies from that port to the sender's address and port.
- **Throttle uses its existing native UDP module**, with its own socket, separate from the central unit's. It sends to the configured Lever IP and port.
- **Size:** each datagram is at most **1200 bytes** (configurable lower). Larger payloads are split (section 5.3).
- **Loss handling:**
  - State messages carry the **complete** state of their subject (one loco, one strip, one line), so a lost one is replaced by the next.
  - Lever re-sends current state at a fixed interval even without changes.
  - Messages that must arrive (line choice, operator edits) are **reliable**: acknowledged, and resent with backoff.

## 5. Messages

### 5.1 Envelope (every datagram)

```
{
  "p": "lever-link",          // protocol name; anything else is ignored
  "v": [1, 0],                // [major, minor]
  "t": "<type>",
  "id": "<sender instance or device id>",
  "ses": "<Lever session id>",  // Lever → Throttle; Throttle echoes the last one it saw
  "seq": 123,                 // per sender, increasing; used for acks and ordering
  "rel": true,                // optional: reliable, receiver must ack
  "ts": 1764331234567,        // sender's clock, ms (informational only)
  "body": { ... }
}
```

**Versioning:**
- A **minor** difference works: unknown fields and unknown types are ignored.
- A **major** difference: Lever answers `error {code: "versionMismatch"}` and ignores the rest. Both sides show "update needed". Driving is unaffected.

**Capabilities:**
- Each side lists the features it supports in `hello` / `welcome`.
- Only the **intersection** is used.
- Version 1 capabilities: `locoInfo`, `locoState`, `functions`, `lines`, `lineChoice`, `strips`, `operatorEdits`, `lineStatus`, `driverView`, `conflicts`, `notices`, `chunking`.
- Reserved for later: `requests`, `pairing`, `thumbnails`, `discovery`.

### 5.2 Types

**Throttle → Lever**

| Type | Rel. | When | Body |
|---|---|---|---|
| `hello` | no | On start, then every `helloIntervalS` (lease) | `device {id, driverName?, app, appVersion}`, `capabilities[]`, `share {locoInfo, locoState, functions}`, `linesVersion?`, `throttles[]`: per throttle slot `{slot, addresses[] (lead first), kind: loco\|consist\|address, line?: {lineId, directionId?}}`, `locosDigest` (hash of the last `locos` body) |
| `locos` | no | On change, and when Lever's `welcome` shows a different digest | `locos[]`: `{address, name, speedSteps, maxSpeedKmh, acceleration, braking}` and, for consists, `consists[]`: `{lead, members[] {address, reversed}}` |
| `locoState` | no | On change, at most `stateRatePerS` per loco | `states[]`: `{address, speedStep, forward, functions?: {"0": true, …}, confirmed: bool}`. `confirmed` means the value came from the central unit's `LAN_X_LOCO_INFO`; otherwise it is a pending local change |
| `setLine` | **yes** | Driver picks or clears a line | `{address (lead), lineId \| null, directionId?}` |
| `getLines` | no | `welcome` shows a newer `linesVersion` | `{}` |
| `ack` | no | Reply to a reliable message | `{seq}` |
| `bye` | no | Link turned off, app to background | `{}` |

**Lever → Throttle**

| Type | Rel. | When | Body |
|---|---|---|---|
| `welcome` | no | Reply to every `hello` | `lever {instanceId, appVersion}`, `project {id, name}`, `capabilities[]`, `linesVersion`, `locosDigestSeen?`, `centralUnit: connected\|interrupted\|lost` |
| `lines` | no | Reply to `getLines` (chunked if needed) | `{version, lines[]}`, see section 6 |
| `strip` | **yes** for operator edits, else no | On change, and every `refreshIntervalS` | Lever's strip for each address this phone drives (section 8) |
| `lineStatus` | no | On change, and every `refreshIntervalS`, for lines chosen on this phone | Section 9.1 |
| `driverView` | no | On change, and every `refreshIntervalS`, for addresses with a Lever train | Section 9.2 |
| `notice` | **yes** | Events | `{code, address?, params?}`. Codes: `locoConflict`, `conflictCleared`, `automationStopped`, `stripChangedByOperator`, `stripEndedByOperator`, `lineRemoved`. Throttle words them itself |
| `error` | no | Refusals | `{code}`: `versionMismatch`, `notAllowed`, `tooManyClients`, `tooLarge`, `rateLimited` |
| `ack` | no | Reply to a reliable message | `{seq}` |

**Reliability:**
- A reliable message is resent after `resendMs` with doubling backoff, up to `resendMaxMs`, until it is acked or replaced by a newer message about the same subject.
- Receivers process each `id`+`seq` once.

### 5.3 Chunking

A body that would exceed the datagram limit is sent as parts: `t: "part"` with `{msgId, index, count, type, data}`, where `data` is a slice of the JSON text. The receiver reassembles all parts within `chunkTimeoutMs` or drops them. Version 1 needs this only for `lines` on large layouts, but both sides implement it for every type.

## 6. Lines (Lever project data)

A **line** is an operator-defined path through the layout, described by **station exits** (Lever's `connector` elements). Defining lines:
- A line is an **ordered list of exits**.
- Consecutive exits in the same station view are a **passage through that station**. Consecutive exits in different views are the **undrawn stretch** between them.
- A line may pass through any number of stations, and may be a **loop**: after the last exit it continues to the first.
- **One exit may belong to several lines**, so lines can converge and share track.

Fields:
- `id`, `name` (e.g. *Punainen*), `shortName` (e.g. *Pun*), `color` (Lever's colour picker), `exits[]` (connector refs in order), `loop`;
- `directional` (default **false**): on the club layout, *Pun* alone is enough. A layout run in both directions can set it to true and define `directions[]` (`{id, name, from: exitRef, to: exitRef}`).
- When a line is directional, a per-line setting decides whether the driver must pick a direction.

Lines are sent to Throttle as `{id, name, shortName, color, loop, directional, directions[]}`. `linesVersion` changes whenever any line changes.

## 7. Locos and conflicts

- **Lever's loco list is primary.** A phone's loco data is kept in memory only, keyed by address, with the phone's device id and a time stamp.
- **When a phone reports an address that is in Lever's list, the two are compared** on the configured fields. Defaults: `speedSteps`, `maxSpeedKmh`, `acceleration`, `braking`, numbers with tolerance `conflictTolerance`; `name` is off by default. A difference is a **conflict**, and Lever immediately does all of this:
  1. raises a notice in Lever and marks the strip;
  2. **stops any Level 4 automatic run of that loco**: the train is braked to 0 at Lever's braking rate, never an emergency stop. Level 3 protection keeps running, with Lever's figures;
  3. sends `notice locoConflict` (and `automationStopped`, if a run was stopped) to every phone driving that address.
  
  The automation does **not** restart by itself when the conflict clears. The operator starts it again.
- **Two phones reporting different data for the same address** is a conflict too: noted, nothing stopped unless rule 2 applies.
- **Addresses not in Lever's list:** the phone's data is used in memory, e.g. the braking rate for a Level 3 hold, if the project setting allows it (default on). It is marked "from phone" wherever it is shown.
- **Loco state** (speed, direction, functions) from phones is shown on strips. It also fills in what Lever knows at Levels 1–2.
  - The central unit's own reports, when Lever has them, always win over a phone's.
  - Unconfirmed phone values are shown as such.

## 8. Strips

**A strip** is one driven loco or consist, keyed by its **lead DCC address**. That address is the strip's number.

Fields:
- `address`, `addresses[]` (consist members), `locoName`;
- `driverName?`, `deviceId?`;
- `line? {lineId, directionId?}`;
- `lineSetBy: driver | operator`, `lineSetAt`;
- `source: phone | manual`;
- `state? (speed, direction)`, `lastHeardAt`;
- `phoneSilent: bool`, `conflict? {fields[], automationStopped}`, `linkedTrainId?` (a Lever train whose loco has this address).

**Lifecycle (configurable):**
- A phone strip is created when a phone declares a loco: by default as soon as the loco is on a throttle screen; it sits under "No line" until a line is chosen.
- It is marked `phoneSilent` after `leaseTimeoutS` without a `hello`, and ended automatically after `stripAutoEndMin` (0 = never). The operator can also end it.
- A **manual strip** is created and ended by the operator, for drivers without the link.

**Edits:**
- The driver sets the line in Throttle; the operator may change the line or direction, the driver name, or end the strip.
- Precedence is configurable: `lastChangeWins` (default) or `operatorWins`.
- Every change records who made it. The phone shows operator changes as "changed by the control station".

**Persistence:** strips live in memory. A setting can keep them across a Lever restart (default off).

Lever's existing train labels are not replaced. When the operator labels a block, Lever offers the strip addresses as suggestions.

## 9. What Lever computes for a phone

### 9.1 `lineStatus`: per chosen line, at every level

For each **station passage** on the line, in line order, and in both directions unless a direction was chosen:
- `station {viewId, name}`, `entry {exitId, name}`;
- `leadsTo`: where the track leads from that entry **with the turnouts as they are**:
  - `exit {exitId, name}` (through the station, the line's next exit or another);
  - `track {name}` (a block or named track, ending at a buffer stop or open end);
  - `against {turnoutId, name}`: a turnout on the way lies another way and no path continues;
  - `unknown {turnoutId, name}`: a position is not known;
- `alongLine: bool` (it leads to the line's next exit);
- `turnouts[]`: `{id, name, position, certainty: confirmed | reported | unknown | manual | moving}`;
- `signals[]` facing that way: `{id, name, aspect: stop | proceed | reduced | expectStop | expectProceed | shunting | unknown, label}`;
- `routes[]` set by this Lever on that stretch: `{id, state: setting | set | unconfirmed | failed, fromName, toName}`;
- `level` of the area.

Positions follow the certainty rules of Lever's live state. A position that was only reported at start-up is `reported`, never `confirmed`.

### 9.2 `driverView`: per address, when a Lever train has this loco (Levels 3–4, with detection)

- `train {id, blockName, stationName, directionKnown}`;
- `freeAhead` (count, up to `lookAheadMax`);
- `endsBy`: `occupied | signalAtStop | endOfTrack | turnoutAgainst | turnoutUnknown | unprotectedArea | limit`;
- `signalAhead? {name, aspect, label}`, `routeAhead? {state, toName}`;
- `nearestOccupied? {blocksAhead, address?}`;
- `level`;
- `hold?`: `signalAtStop | occupiedAhead | enteredOccupied | endOfTrack | turnoutAgainst | turnoutUnknown`;
- `controlled` (Lever drives the loco now);
- `auto? {state: waiting | routing | running | stopping | dwelling | done, reason?, nextStopName?}`;
- `stale` (Lever's own central-unit connection is interrupted or lost).

`freeAhead` and `endsBy` come from **the same pure look-ahead function** that Level 3 protection uses, so the phone can never disagree with the brakes.

## 10. Compatibility

**Lever project files:**
- Every existing file opens.
- New data (lines, link settings, conflict settings) is optional with defaults.
- Migrating to the new schema gives a file a new-format `id` and keeps the old one in `previousIds[]`. Anything keyed by project id (turnout memory) is looked up through `previousIds`.
- New files carry `minReaderVersion`, the oldest schema that can safely read them; additive changes don't raise it.
- Unknown fields are preserved on load and save, so an older Lever that can read a file does not drop newer data.
- The current release build has none of this logic, so it refuses files migrated by the new version. The migration backup protects the original.

**Throttle:** database migrations and settings are additive only.

**Protocol:** section 5.1.

**Each side alone:**
- Lever with no linked phones, or phones sending only some capabilities, works as before.
- Throttle facing silence or an old Lever behaves as if no control station were set: it tries every few seconds at most, with backoff, and never affects driving.

## 11. Configurable values (defaults)

| Where | Setting | Default |
|---|---|---|
| Both | Link enabled | off |
| Both | Port | 21110 |
| Throttle | Lever IP | empty (link off) |
| Throttle | Driver name | empty |
| Throttle | Share loco info / live state / functions | on / on / on |
| Throttle | Hello (lease) interval | 3 s |
| Throttle | "No data" shown after | 6 s silence |
| Throttle | Retry backoff | 3 s → 30 s |
| Throttle | State messages per loco | max 4 per s |
| Throttle | Remember last line per loco/consist | on |
| Lever (app) | Allowed source ranges | private (10/8, 172.16/12, 192.168/16) and link-local |
| Lever (app) | Max phones | 20 |
| Lever (app) | Lease timeout (phone silent) | 10 s |
| Lever (app) | Refresh interval | 2 s |
| Lever (app) | Max datagrams per phone | 10 per s |
| Lever (app) | Max datagram size | 1200 B |
| Both | Resend / max resend / chunk timeout | 500 ms / 8 s / 2 s |
| Lever (project) | Conflict fields / tolerance | speed steps, top speed, acceleration, braking / 0.05 |
| Lever (project) | Use phone figures for locos not in the list | on |
| Lever (project) | Strip creation | when a loco is on screen |
| Lever (project) | Strip auto-end | 10 min |
| Lever (project) | Line edit precedence | last change wins |
| Lever (project) | Keep strips across restart | off |
| Lever (project) | Look-ahead limit | 5 blocks |
| Lever (project, per line) | Direction required | off |

## 12. Later (room left in the protocol)

- Driver requests (`requests`): route requests and "ready to depart", through Lever's level checks.
- Pairing codes (`pairing`), required once requests exist.
- Discovery (`discovery`) by UDP broadcast.
- Loco thumbnails (`thumbnails`).
- Several Levers with area ownership (Lever MULTI-7).
- An optional fail-open "don't fight the control station" mode in Throttle.
