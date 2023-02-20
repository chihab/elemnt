import { Directive } from "@angular/core";

export type Accessor = { prop?: string; event?: string };
export interface ElementConfig<T = any> {
  ref?: keyof T;
  accessor?: Accessor;
}

export const CONFIG_KEY = Symbol("config");
export const CONFIG_DEFAULT: ElementConfig = { ref: 'e', accessor: { prop: "value", event: "input" } };

export function Element<T = typeof Directive>(_config: ElementConfig<T> = CONFIG_DEFAULT) {
  return function (Cmp: any) {
    const { accessor, ref } = {
      ref: (_config.ref || CONFIG_DEFAULT.ref) as string,
      accessor: { ...CONFIG_DEFAULT.accessor, ..._config.accessor }
    };
    Cmp.prototype[CONFIG_KEY] = { accessor, ref };
    const inputs = Cmp.ɵcmp?.inputs || Cmp.ɵdir?.inputs || {};
    Object.keys(inputs).forEach((input) => {
      const prop = inputs[input];
      Object.defineProperty(Cmp.prototype, input, {
        get() {
          if (!this[ref]) throw new Error("You need to inject ElementRef");
          return this[ref].nativeElement[prop];
        },
        set(val: any) {
          if (!this.e) throw new Error("You need to inject ElementRef");
          if (!this.z) throw new Error("You need to inject NgZone");
          this.z.runOutsideAngular(() => (this.e.nativeElement[prop] = val));
        },
      });
    });
  };
}
