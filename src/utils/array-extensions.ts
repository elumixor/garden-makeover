export const __dummy = {};

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Array<T> extends ReadonlyArray<T> {
    /**
     * Removes the first occurrence of the given element from the array.
     * @param element The element to remove.
     */
    remove(...element: T[]): void;
  }
}

Reflect.defineProperty(Array.prototype, "remove", {
  value(this: unknown[], ...elements: unknown[]) {
    for (const element of elements) {
      const index = this.indexOf(element);
      if (index < 0) return;
      this.splice(index, 1);
    }
  },
  writable: false,
  configurable: true,
});
