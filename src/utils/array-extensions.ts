export const __dummy = {};

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface ReadonlyArray<T> {
    /** Returns the first element of the array, or undefined if the array is empty.  */
    get first(): T | undefined;
    /** Returns true if the array is empty, false otherwise. */
    get isEmpty(): boolean;
    /** Returns true if the array is not empty, false otherwise. */
    get nonEmpty(): boolean;
    /** Returns a new array with the first `count` elements. */
    take(count: number): T[];
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Array<T> extends ReadonlyArray<T> {
    /**
     * Removes the first occurrence of the given element from the array.
     * @param element The element to remove.
     */
    remove(...element: T[]): void;
  }
}

Reflect.defineProperty(Array.prototype, "isEmpty", {
  get(this: unknown[]) {
    return this.length === 0;
  },
  configurable: true,
});

Reflect.defineProperty(Array.prototype, "nonEmpty", {
  get(this: unknown[]) {
    return this.length > 0;
  },
  configurable: true,
});

Reflect.defineProperty(Array.prototype, "first", {
  get(this: unknown[]) {
    return this.length > 0 ? this[0] : undefined;
  },
  configurable: true,
});

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

Reflect.defineProperty(Array.prototype, "take", {
  value(this: unknown[], count: number) {
    return this.slice(0, count);
  },
  writable: false,
});
