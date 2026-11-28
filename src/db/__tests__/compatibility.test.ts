import {ConsistRepository} from '../consistRepository';
import {LocoRepository} from '../locoRepository';
import {migrate, SCHEMA_VERSION} from '../migrations';
import {openTestDatabase} from '../testUtils/nodeSqlite';

// A frozen copy of the schema release ships (0.2.6, user_version 5), as
// SQLite stores it after migrations 1–5. Do not update it when adding a
// migration: the point is that a database from release keeps working.
const RELEASE_SCHEMA = `
  CREATE TABLE locos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address INTEGER NOT NULL,
    speed_steps INTEGER NOT NULL DEFAULT 128,
    max_speed INTEGER NOT NULL DEFAULT 100,
    speed_display TEXT NOT NULL DEFAULT 'kmh',
    photo TEXT,
    notes TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL DEFAULT '',
    railway TEXT NOT NULL DEFAULT '',
    article_number TEXT NOT NULL DEFAULT '',
    decoder_type TEXT NOT NULL DEFAULT '',
    build_year TEXT NOT NULL DEFAULT '',
    position INTEGER NOT NULL,
    acceleration REAL NOT NULL DEFAULT 5,
    braking REAL NOT NULL DEFAULT 5
  );
  CREATE TABLE loco_functions (
    loco_id INTEGER NOT NULL REFERENCES locos(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'none',
    momentary INTEGER NOT NULL DEFAULT 0,
    slot INTEGER NOT NULL,
    PRIMARY KEY (loco_id, number)
  );
  CREATE TABLE consists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    photo TEXT,
    position INTEGER NOT NULL
  );
  CREATE TABLE consist_members (
    consist_id INTEGER NOT NULL REFERENCES consists(id) ON DELETE CASCADE,
    loco_id INTEGER NOT NULL REFERENCES locos(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    reversed INTEGER NOT NULL DEFAULT 0,
    speed_offset INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (consist_id, loco_id)
  );
  CREATE TABLE loco_speed_times (
    loco_id INTEGER NOT NULL REFERENCES locos(id) ON DELETE CASCADE,
    step INTEGER NOT NULL,
    seconds REAL NOT NULL,
    PRIMARY KEY (loco_id, step)
  );
  PRAGMA user_version = 5;
`;

const RELEASE_DATA = `
  INSERT INTO locos (id, name, address, speed_steps, max_speed, speed_display,
    photo, notes, full_name, railway, article_number, decoder_type,
    build_year, position, acceleration, braking)
  VALUES
    (1, 'SBB Vectron', 6503, 128, 200, 'kmh', 'a.jpg', 'note', 'Re 475',
      'SBB', '71950', 'ESU', '2019', 0, 3.5, 7),
    (2, 'Dm12', 12, 28, 80, 'step', NULL, '', '', '', '', '', '', 2, 5, 5);
  INSERT INTO loco_functions VALUES
    (1, 0, '', 'headlight', 0, 0),
    (1, 2, 'Horn', 'horn', 1, 9);
  INSERT INTO consists VALUES (1, 'Double', NULL, 1);
  INSERT INTO consist_members VALUES (1, 1, 0, 0, 0), (1, 2, 1, 1, -3);
  INSERT INTO loco_speed_times VALUES (1, 10, 80.3), (1, 20, 40.24);
`;

describe('a database from release', () => {
  it('opens and loads unchanged', async () => {
    const db = openTestDatabase();
    await db.execAsync(RELEASE_SCHEMA + RELEASE_DATA);
    await migrate(db);

    const version = await db.getFirstAsync<{user_version: number}>(
      'PRAGMA user_version',
    );
    expect(version?.user_version).toBe(SCHEMA_VERSION);
    expect(SCHEMA_VERSION).toBeGreaterThanOrEqual(5);

    const locos = await new LocoRepository(db).list();
    expect(locos).toEqual([
      {
        id: 1,
        name: 'SBB Vectron',
        address: 6503,
        speedSteps: 128,
        maxSpeed: 200,
        speedDisplay: 'kmh',
        acceleration: 3.5,
        braking: 7,
        photo: 'a.jpg',
        notes: 'note',
        details: {
          fullName: 'Re 475',
          railway: 'SBB',
          articleNumber: '71950',
          decoderType: 'ESU',
          buildYear: '2019',
        },
        functions: [
          {number: 0, name: '', icon: 'headlight', momentary: false, slot: 0},
          {number: 2, name: 'Horn', icon: 'horn', momentary: true, slot: 9},
        ],
        speedTimes: [
          {step: 10, seconds: 80.3},
          {step: 20, seconds: 40.24},
        ],
      },
      expect.objectContaining({id: 2, address: 12, speedSteps: 28}),
    ]);

    expect(await new ConsistRepository(db).list()).toEqual([
      {
        id: 1,
        name: 'Double',
        photo: null,
        members: [
          {locoId: 1, reversed: false, speedOffset: 0},
          {locoId: 2, reversed: true, speedOffset: -3},
        ],
      },
    ]);
  });
});
