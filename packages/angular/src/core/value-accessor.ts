import { Directive, ElementRef, HostListener } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { CONFIG_DEFAULT, CONFIG_KEY, ElementConfig } from "./elemnt";


@Directive()
export class ElementValueAccessor implements ControlValueAccessor {
  private lastValue: any;

  [index: symbol]: ElementConfig;

  constructor() {
    if (!this[CONFIG_KEY]) {
      this[CONFIG_KEY] = CONFIG_DEFAULT
    }
  }

  ngOnInit() {
    this.element.nativeElement.addEventListener(this.accessorEvent, this.onEvent);
    this.element.nativeElement.addEventListener('focusout', this.onTouched);
  }

  ngOnDestroy() {
    this.element.nativeElement.removeEventListener(
      this.accessorEvent,
      this.onEvent
    );
    this.element.nativeElement.removeEventListener(
      'focusout',
      this.onTouched
    );
  }

  writeValue(value: unknown) {
    this.element.nativeElement[this.accessorProp] = this.lastValue = value == null ? "" : value;
  }

  onEvent = ($event: any) => {
    const value = $event.target?.[this.accessorProp];
    if (value !== this.lastValue) {
      this.lastValue = value;
      this.onChange(value);
    }
  };

  onChange: (value: any) => void = () => { };
  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  onTouched: () => void = () => { };
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    (this.element.nativeElement as unknown as HTMLInputElement).disabled = isDisabled;
  }


  private get element() {
    return this[this[CONFIG_KEY].ref as symbol] as ElementRef;
  }

  private get accessorProp() {
    return this[CONFIG_KEY].accessor?.prop as keyof ElementRef;
  }

  private get accessorEvent() {
    return this[CONFIG_KEY].accessor?.event as keyof ElementRef;
  }
}
