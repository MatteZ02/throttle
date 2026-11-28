# Driver interface: Lever ↔ Throttle (plan notes)

Notes for planning a joint feature: a **driver's view** in Throttle, fed by Lever, like the cab
display on a real railway. This file exists in both repositories with the same content: Lever
`docs/driver-interface.md` and Throttle `docs/lever-driver-interface.md`. Nothing here is built
yet; it records what each side already has and what must be decided. Keep both copies in step.

## Goal

A driver with Throttle sees, for the loco they are driving, what the control station (Lever)
knows and the central unit does not:

- their **train**: train number, where it is (block, station);
- the **signal ahead** and its aspect, and the **route set ahead** (to where, set or not);
- **movement authority**: how many blocks ahead are free;
- **Level 3**: why the train is being stopped (signal at stop, track ahead occupied, end of
  track, turnout against or unknown), so a driver is not surprised by Lever braking their loco;
- **Level 4**: that the train is driven automatically, its destination or schedule, and its
  state (waiting and why, running, stopping, at a stop);
- traffic nearby: other trains and occupied track ahead.

Live speed, direction and functions stay Throttle's own (from the central unit).

## Ground rules (from both briefs)

- **Throttle keeps working without Lever** (Lever brief CON-5, section 13). The driver's view is an
  extra; nothing in driving may wait for Lever.
- **No server, cloud, accounts or telemetry** in either app. Lever ↔ Throttle is local network
  only, opt-in, and must not add load on the central unit (the Z21 is shared with up to 10
  Throttles; Lever's own traffic rules, LOAD-2, stay as they are).
- **Lever is the authority for logical state** (routes, trains, holds, automatic runs); the central
  unit for physical state. Throttle shows Lever's view; it does not compute protection itself.
- **First version read-only**: Throttle only receives. Requests from the driver (e.g. "ready to
  depart", asking for a route) are a later step and would go through Lever's level checks.
- Both apps: strings in English and Finnish (Finnish written natively, RATO terms), status never by
  colour alone, TypeScript strict, Zod at every process or network boundary.

## What Lever has today (commit references: Lever `release`)

- **Engine API** (`src/shared/engineApi.ts`): versioned, Zod-validated messages between the
  engine (utility process) and windows over a MessagePort. The brief's ARC-1 says the same
  messages can later go over the network (WebSocket); that has not been built.
- **Live state** (`src/shared/liveState.ts`), sent as changes:
  - `trains`: `TrainLive` = id, name (train number), `locoId`, `blockIds` (front first),
    `directionKnown`, `speedKmh`, `forward`, `hold` (Level 3 reason), `auto` (Level 4 state,
    reason, destination block or schedule), `controlled` (Lever drives the loco now);
  - `blocks`: occupied, releasing, label (train number), detected locos (RailCom, if reported);
  - `signals`: aspect per signal; `routes`: routes set by this Lever (from, to, state, path);
  - `automationPaused`.
- **Locos** in the project file (`src/model/locos.ts`): name, **DCC address**, speed steps, top
  speed, acceleration and braking (km/h per second, the same meaning as Throttle's loco library),
  cruise and approach speed. The DCC address is the natural key to match Throttle's loco.
- **What lies ahead** of a train: `nextBlock` in `src/model/blockGraph.ts` (next block, end of
  track, blocked, unknown; signals facing the train on the way). Protection uses it
  (`src/interlocking/protection.ts`); a driver's view would use the same walk.
- **Limits**: each Lever knows only its own routes and trains (MULTI-6). Area ownership between
  several Levers (MULTI-7) is not built; a driver's view must come from the Lever that runs the
  train's area.

## What Throttle has today

- Expo / React Native app, UDP to the central unit through its own native module
  (`modules/z21-udp`), connection manager, loco library with DCC address, acceleration and
  braking (power handle drive mode), consists, split screen.
- It knows which locos (addresses) are on screen and driven; it subscribes up to 16 locos per
  client.
- No network service other than the central unit; no Lever awareness.

## To decide when planning

1. **Transport.** Options, each local network only:
   - WebSocket served by Lever (needs a WebSocket library in Lever, whose runtime dependencies are
     only `zod` so far, or a small hand-written server on `node:http`); React Native has a
     WebSocket client built in.
   - UDP with JSON datagrams on a Lever port; Throttle already has a UDP module. Needs its own
     loss handling (full state now and then).
   - HTTP with Server-Sent Events from `node:http` (read-only push); React Native has no built-in
     EventSource.
2. **Finding Lever.** Typing its IP address in Throttle's settings (like the central unit's), or
   discovery (mDNS / UDP broadcast). Several Levers on the network.
3. **Which process serves it** in Lever: the engine (it owns the live state; utility process) or
   the main process.
4. **Message shape.** A per-loco "driver view" computed by Lever (train, signal ahead, route
   ahead, free blocks ahead, hold reason, automatic state) versus raw live state that Throttle
   interprets. A per-loco view keeps Throttle simple and the rules in one place.
5. **Shared types.** A small shared package of Zod schemas (like `packages/z21-protocol`, which
   Lever copies from Throttle) used by both; Zod works in React Native.
6. **Access.** Opt-in in Lever (off by default), read-only, perhaps a pairing code; what a
   driver may see (all trains or only their own).
7. **Throttle UI.** Where the view goes (above the speed control, a strip, a tab), how it looks
   on a phone and in split screen, and what is shown when Lever is not reachable (nothing, and
   driving unaffected).

## Short notice for a planning prompt

> Plan a driver's view in Throttle fed by Lever. Read `docs/lever-driver-interface.md` in Throttle
> and `docs/driver-interface.md` in Lever (same content), then both repos' `CLAUDE.md`. Lever is at
> `D:\GitHub\lever`, Throttle at `D:\GitHub\aaltoenergia\ar-z21`. Keep Throttle fully usable without
> Lever; local network only, opt-in, read-only first. Propose the transport, discovery, message
> shape and Throttle UI, with the decisions listed under "To decide when planning", before writing
> code.
