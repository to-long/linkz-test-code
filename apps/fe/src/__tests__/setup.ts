// Test setup: mock browser globals before any module imports

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(globalThis, "document", {
  value: {
    documentElement: {
      classList: {
        toggle: () => {},
        add: () => {},
        remove: () => {},
        contains: () => false,
      },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  },
  writable: true,
});
