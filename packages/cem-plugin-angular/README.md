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
