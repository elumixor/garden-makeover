/** Lightweight DOM helper for concise element creation. */
export interface IDomOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string | number | boolean>;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface HTMLElement {
    addElement<T extends keyof HTMLElementTagNameMap>(
      this: HTMLElement,
      tag: T,
      opts?: IDomOptions,
    ): HTMLElementTagNameMap[T];
  }
}

if (!Reflect.has(HTMLElement.prototype, "addElement"))
  Reflect.defineProperty(HTMLElement.prototype, "addElement", {
    value<T extends keyof HTMLElementTagNameMap>(this: HTMLElement, tag: T, opts: IDomOptions = {}) {
      const node = document.createElement(tag);
      if (opts.className) node.className = opts.className;
      if (opts.text != null) node.textContent = String(opts.text);
      if (opts.attrs)
        for (const [k, v] of Object.entries(opts.attrs)) {
          if (v === false || v == null) continue;
          node.setAttribute(k, v === true ? "" : String(v));
        }

      this.appendChild(node);
      return node;
    },
    configurable: true,
  });

/** Decorator to auto-register a custom element. If no tag provided, one is
 *  generated from the class name (PascalCase -> kebab-case) with `gm-` prefix.
 *  Example: class DayNightWidget -> <gm-day-night-widget>.
 */
export function customElement(tag?: string) {
  return function <T extends CustomElementConstructor>(ctor: T) {
    if (!tag) {
      const name = ctor.name
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
      tag = "gm-" + name;
    }
    if (!customElements.get(tag)) customElements.define(tag, ctor);
  };
}

export function createSVG(type = "svg") {
  return document.createElementNS("http://www.w3.org/2000/svg", type);
}
