export type Awaitable<T = void, P extends PromiseLike<T> = PromiseLike<T>> = T | P;
export type GetEventData<T extends EventEmitter<unknown>> = T extends EventEmitter<infer U> ? U : never;

export type EventHandler<T> = (eventData: T) => unknown;

export class EventEmitter<TEventData = void> {
  protected readonly callbacks = new Array<EventHandler<TEventData>>();
  private _value?: TEventData;
  readonly first = this.nextEvent.then((value) => (this._value = value));

  /** Returns a promise that is resolved once the event is emitted. */
  get nextEvent(): PromiseLike<TEventData> {
    return new Promise((resolve) => this.subscribeOnce(resolve));
  }

  get value() {
    return this._value;
  }

  /** Subscribes the callback to the event. */
  subscribe(callback: EventHandler<TEventData>) {
    this.callbacks.push(callback);

    return {
      unsubscribe: () => this.unsubscribe(callback),
    };
  }

  /** Emits the event. */
  emit(eventData: TEventData) {
    this._value = eventData;

    // Some subscribers may want to unsubscribe after the event
    // This leads to modification of `this.callbacks`
    // To avoid problems, we should iterate on the copy
    for (const callback of [...this.callbacks]) void callback(eventData);
  }

  /** Unsubscribes the callback from the event. */
  unsubscribe(callback: EventHandler<TEventData>) {
    this.callbacks.remove(callback);
  }

  /** Calls `unsubscribe()` immediately after the callback is invoked. */
  subscribeOnce(callback: EventHandler<TEventData>) {
    const wrappedCallback = (eventData: TEventData) => {
      void callback(eventData);
      this.unsubscribe(wrappedCallback);
    };

    return this.subscribe(wrappedCallback);
  }

  pipe(): EventEmitter<TEventData>;
  pipe<TOut>(callback: (eventData: TEventData) => TOut): EventEmitter<TOut>;
  pipe(callback?: (eventData: TEventData) => unknown) {
    if (!callback) {
      const eventEmitter = new EventEmitter<TEventData>();
      this.subscribe((eventData) => eventEmitter.emit(eventData));
      return eventEmitter;
    }

    const eventEmitter = new EventEmitter<unknown>();
    this.subscribe((eventData) => eventEmitter.emit(callback(eventData)));
    return eventEmitter;
  }
}

export class AsyncEventEmitter<TEventData = void> {
  protected readonly callbacks = new Array<(arg: TEventData) => Awaitable>();

  constructor(protected readonly strategy: "sequential" | "parallel" = "sequential") {}

  /** Returns a promise that is resolved once the event is emitted. */
  get nextEvent(): PromiseLike<TEventData> {
    return new Promise((resolve) => this.subscribeOnce(resolve));
  }

  /** Subscribes the callback to the event. */
  subscribe(callback: (eventData: TEventData) => Awaitable) {
    this.callbacks.push(callback);

    return {
      unsubscribe: () => this.unsubscribe(callback),
    };
  }

  /** Emits the event. */
  async emit(eventData: TEventData) {
    const callbacks = [...this.callbacks];
    if (this.strategy === "sequential") for (const callback of callbacks) await callback(eventData);
    else await Promise.all(callbacks.map((callback) => callback(eventData)));
  }

  /** Unsubscribes the callback from the event. */
  unsubscribe(callback: (eventData: TEventData) => Awaitable) {
    this.callbacks.remove(callback);
  }

  /** Calls `unsubscribe()` immediately after the callback is invoked. */
  subscribeOnce(callback: (eventData: TEventData) => Awaitable) {
    const wrappedCallback = async (eventData: TEventData) => {
      await callback(eventData);
      this.unsubscribe(wrappedCallback);
    };

    return this.subscribe(wrappedCallback);
  }

  pipe(): AsyncEventEmitter<TEventData>;
  pipe<TOut>(callback: (eventData: TEventData) => TOut): AsyncEventEmitter<TOut>;
  pipe(callback?: (eventData: TEventData) => unknown) {
    if (!callback) {
      const eventEmitter = new AsyncEventEmitter<TEventData>();
      this.subscribe((eventData) => eventEmitter.emit(eventData));
      return eventEmitter;
    }

    const eventEmitter = new AsyncEventEmitter<unknown>();
    this.subscribe((eventData) => eventEmitter.emit(callback(eventData)));
    return eventEmitter;
  }
}
