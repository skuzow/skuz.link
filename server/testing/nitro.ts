import type {
  NitroApp,
  NitroAppPlugin,
  NitroRuntimeHooks,
  Task
} from 'nitropack/types';

type HookName = keyof NitroRuntimeHooks;
type HookCallback = (...args: never[]) => unknown;

const registeredHooks = new Map<HookName, HookCallback[]>();

// stands in for Nitro's runtime app: the test server runs every layer's
// plugins against it, and server code reaches it through useNitroApp()
const testNitroApp = {
  hooks: {
    hook: (name: HookName, callback: HookCallback) => {
      registeredHooks.set(name, [
        ...(registeredHooks.get(name) ?? []),
        callback
      ]);
    },
    callHook: async (name: HookName, ...args: never[]) => {
      for (const callback of registeredHooks.get(name) ?? [])
        await callback(...args);
    },
    removeAllHooks: () => registeredHooks.clear()
  }
} as unknown as NitroApp;

export const useNitroApp = (): NitroApp => testNitroApp;

export const defineNitroPlugin = (plugin: NitroAppPlugin): NitroAppPlugin =>
  plugin;

export const defineTask = <RT = unknown>(task: Task<RT>): Task<RT> => task;
