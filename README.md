# @elemnt/angular (WIP)

Custom Elements with strict typing.

✅ No need for CUSTOM_ELEMENTS_SCHEMA
<br />
✅ Works with any Custom Element
<br />
✅ Strictly Typed properties
<br />
✅ Good experience with Angular Language Service
<br />
✅ Easy way to create Value Accessors [(ngModel)]
<br />
✅ Small runtime overhead (~1KB)

## In a nutshell

Given the Custom Element below

```ts
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ui-button")
export class Button extends LitElement {
  @property({ type: String })
  text: string = "";

  protected render() {
    return html`<button>${this.text}</button>`;
  }
}
```

In order to have strict type checking we need to create an Angular Component wrapping it.

`@elemnt/angular` makes it simple.

```ts
import { Component, ElementRef, inject, Input, NgZone } from "@angular/core";
import { Element } from "@elemnt/angular";

import type { UiRange } from "ui-range";
import "ui-range/ui-range.js";

@Element()
@Component({
  selector: "ui-button",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: "<ng-content></ng-content>",
  standalone: true,
})
export class ButtonComponent {
  e = inject(ElementRef);
  z = inject(NgZone);
  @Input() text!: Button["text"];
}

@Component({
  selector: "app-root",
  template: `
    <!-- Wrong properties are not accepted --> ✅
    <ui-range
      [range]="'This is not a number'" // Wrong Type is not accepted ✅
      [unitx]="'kg'" // Typo in property is not accepted ✅
    ></ui-range>
    
    <!-- 2. Wrong Selector is not accepted -->  ✅
    <ui-rangerrr [range]="75" [unit]="'❤'"></ui-rangerrr>
  `,
  imports: [UiRangeComponent], // Import the Component Wrapper
  standalone: true,
})
export class AppComponent {
  range = 90;
}
```

## The issue with `CUSTOM_ELEMENTS_SCHEMA`

In order to use a custom element in our template we usually add `CUSTOM_ELEMENTS_SCHEMA` to the schemas of the `NgModule` or Standalone Component.

`CUSTOM_ELEMENTS_SCHEMA` allows any custom-tag with any property without type checking.

```html
<!-- CUSTOM_ELEMENTS_SCHEMA is dangerous!--> ❌

<!-- Wrong properties -->
<ui-range
  [range]="'This is not a number'" // Wrong Type is accepted ❌
  [unitx]="'kg'" // Typo in property is ignored ❌
></ui-range>

<!-- Wrong selector is accepted -->
<ui-rangerrr [range]="75" [unit]="'❤'"></ui-rangerrr> ❌
```

```ts
import "ui-range/ui-range.js";

@Component({
  selector: "app-root",
  template: "./app.component.html",
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // This is dangerous for your templates ❌
  standalone: true,
})
export class AppComponent {}
```

### **@elemnt/angular**

@elemnt/angular helps creating tiny component wrappers.

```sh
npm add @elemnt/angular
```

```ts
import { Element, ElementProvider } from "@elemnt/angular";

// 1. Import Custom Element
import "ui-range/ui-range.js";
import type { UiRange } from "ui-range";

// 2. Decorate with @Element
@Element()
@Component({
  // 3. Use the name of your custom element
  selector: "ui-range",
  template: "<ng-content></ng-content>",
  standalone: true,
})
export class UiRangeComponent {
  // 4. Inject ElementREf and NgZone, this are used by the Element decorator
  e = inject(ElementRef);
  z = inject(NgZone);
  // 5. Add the Inputs you need
  @Input() value!: UiRange["value"];
  @Input() unit!: UiRange["unit"];
  @Input() interval!: UiRange["interval"];
}
```

```ts
@Component({
  selector: "app-root",
  template: "./app.component.html",
  imports: [UiRangeComponent], // 0. Import the Component Wrapper
  standalone: true,
})
export class AppComponent {
  range = 90;
}
```

```html
<!-- wrong properties are not accepted --> ✅
<ui-range
  [range]="'This is not a number'" // Wrong Type is not accepted
  [unitx]="'kg'" // Typo in property is not accepted
></ui-range>

<!-- wrong selector is not accepted -->  ✅
<ui-rangerrr [range]="75" [unit]="'❤'"></ui-rangerrr>
```

## Custom Form Components

In order to attach the default value accessor to a custom element we can add `ngDefaultControl` attribute
but it does not work with Custom Events

```html
<ui-range
  ngDefaultControl // Does not match our Custom Element 'range' event ❌
  [(ngModel)]="range" ❌
  [unit]="{'wrong': 'type'}"  ❌
  [unknown]="2"  ❌
></ui-range>
<p>Range: {{ range }}</p>
```

```ts
@Component({
  selector: "app-root",
  template: "./app.component.html",
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // This is dangerous for your templates ❌
  standalone: true,
})
export class AppComponent {
  range = 90;
}
```

### @elemnt/angular

```ts
@Component({
  selector: "app-root",
  template: ` <ui-range [(ngModel)]="range" unit="kg"></ui-range> `,
  imports: [UiRangeComponent],
  standalone: true,
})
export class AppComponent {
  range = 90;
}
```

```ts
import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Element, ElementValueAccessor } from "@elemnt/angular";

import type { UiRange } from "ui-range";
import "ui-range/ui-range.js";

// 1. Add binding configuration
//    Default is { prop: "value", event: "input" }
@Element({ accessor: { prop: "value", event: "range" } })
@Component({
  selector: "ui-range",
  template: "<ng-content></ng-content>",
  standalone: true,

  // 2. Provide the component to NG_VALUE_ACCESSOR
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiRangeComponent),
      multi: true,
    },
  ],
})
export class UiRangeComponent extends ElementValueAccessor {
  // 3. Extend ElementValueAccessor

  @Input() value!: UiRange["value"];
  @Input() unit!: UiRange["unit"];
  @Input() interval!: UiRange["interval"];
}
```

## Component overhead

The `@Element()` Component wrapper is lightweight, here is a comparaison of the usage a basic component
used in the template with `CUSTOM_ELEMENTS_SCHEMA` and with `@elemnt/angular`

**CUSTOM_ELEMENTS_SCHEMA**

```
Initial Chunk Files       | Names  |  Raw Size | Estimated Transfer Size
main.8ab91566fd99e31c.js  | main   | 101.30 kB |                30.97 kB
```

**@elemnt/angular**

```
Initial Chunk Files       | Names  |  Raw Size | Estimated Transfer Size
main.756c16a61c1d76e0.js  | main   | 104.81 kB |                31.89 kB
```

Runtime overhead

- **< 1kb** for a single component.
- `@Element` bundled code is shared/not duplicated if used in multiple component wrappers



# @elemnt/cem-plugin-angular (WIP)

[@custom-elements-manifest/analyzer](https://github.com/open-wc/custom-elements-manifest) plugin to automatically create Angular wrappers for your custom elements based on your custom elements manifest.

## Usage

### Install:

```bash
npm i -D @elemnt/cem-plugin-angular
```

### Import

`custom-elements-manifest.config.js`:
```js
import angular  from 'cem-plugin-angular';

export default {
  plugins: [
    angular()
  ]
}
```

### Configuration

`custom-elements-manifest.config.js`:
```js
import angular from 'cem-plugin-angular';

export default {
  plugins: [
    angular({
        /** Directory to write the React wrappers to, defaults to `legacy` */
        outDir: './angular',
        /** Array of classNames to exclude */
        exclude: ['MyElement']
        /** Whether to generate a Standalone component for each component, defaults to `true` */
        standalone: true,
        /** Whether to generate a NgModule for each component, defaults to `true` */
        ngModule: false,
        /** which components should be integrated with ngModel. 
         * It lets you set what the target prop is (i.e. value), which event will cause the target prop to change, and more. */
        accessors: [{
            event: "input",
            prop: "value",
            elements: ["ui-text"],
        }],
        /** A mapper to get the custom element import */
        packageMapper: (packageJson, component) => {
            return packageJson.name + `/${component.name.toLowerCase()}.js`
        }
    });
  ]
}
```

