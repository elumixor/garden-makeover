/* eslint-disable @typescript-eslint/no-explicit-any */
type Constructor<T = object> = new (...args: any[]) => T;

const registry = new Map<Constructor, unknown>();

export const di = {
  injectable<T extends Constructor>(this: void, ctor: T): T {
    class Wrapper extends ctor {
      constructor(...args: any[]) {
        if (registry.has(ctor)) throw new Error(`Class ${ctor.name} is already registered.`);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(...args);
        registry.set(Wrapper, this);
      }
    }

    // Keep the original class name for debugging purposes
    Reflect.defineProperty(Wrapper, "name", { value: ctor.name });

    return Wrapper;
  },
  inject<T extends object>(ctor: Constructor<T>): T {
    const instance = registry.get(ctor);
    if (!instance) throw new Error(`No instance found for ${ctor.name}. Make sure it is registered with @injectable.`);

    return instance as T;
  },
};
