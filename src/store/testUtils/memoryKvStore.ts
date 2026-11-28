// An in-memory stand-in for expo-sqlite/kv-store, the settings storage. Use
// in a test file with:
//   jest.mock('expo-sqlite/kv-store', () =>
//     jest.requireActual('../../store/testUtils/memoryKvStore'),
//   );
// `memory` holds what the settings store saved, as JSON text. It is shared
// through globalThis, so every copy of this module (jest.isolateModules)
// sees the same data.
const shared = globalThis as {__memoryKvStore?: Map<string, string>};
shared.__memoryKvStore ??= new Map<string, string>();
export const memory = shared.__memoryKvStore;

const memoryKvStore = {
  getItemSync: (name: string): string | null => memory.get(name) ?? null,
  setItemSync: (name: string, value: string): void => {
    memory.set(name, value);
  },
  removeItemSync: (name: string): void => {
    memory.delete(name);
  },
};

export default memoryKvStore;
