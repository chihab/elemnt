import * as fs from "fs";
import * as path from "path";
import * as prettier from "prettier";

const packageJsonPath = `${process.cwd()}${path.sep}package.json`;
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

import { mkdirp } from 'mkdirp'

export interface AccessConfig {
    event: string;
    prop: string;
    elements: string[];
}

export interface PluginConfig {
    exclude: string[];
    outDir: string;
    exportFile: string;
    packageMapper: (packageJson, component) => string;
    accessors: AccessConfig[];
    standalone: boolean;
    ngModule: boolean;
    register: boolean;
}

function getComponentsMetaData(modules, exclude, accessors) {
    return modules.reduce(
        (components, mod) => {
            mod.declarations.forEach((dec) => {
                if (
                    !exclude.includes(dec.name) &&
                    (dec.customElement || dec.component?.tagName)
                ) {
                    const accessor = accessors
                        .filter(
                            (accessor) =>
                                accessor.elements.findIndex(
                                    (element) => element === dec.tagName
                                ) > -1
                        )
                        .pop();
                    if (accessor) {
                        dec.accessor = accessor;
                    }
                    components.push(dec);
                }
            });
            return components;
        }, []
    );
}

function v(value) {
    if (typeof value === "string")
        return value || "";
    if (Array.isArray(value))
        return value.length ? value.join(", ") : "";
    return "";
}

function b(value, condition) {
    return condition ? value : "";
}

function getComponentCode(component, packageName, standalone, ngModule, register) {
    const className = `${component.name}Component`;
    const inputs = component.attributes
        ?.filter(({ fieldName: name }) => name)
        .reduce((str, { fieldName: name }) => {
            str =
                str +
                `@Input("${name}") ${name}!: ${component.name}['${name}'];\n`;
            return str;
        }, "");

    const coreImports = [];
    if (inputs) {
        coreImports.push("Input");
    }
    if (ngModule || !standalone) {
        coreImports.push("NgModule");
    }

    return `
        import {
            Component,
            ChangeDetectionStrategy,
            ElementRef,
            inject,
            NgZone,
            ${v(coreImports)}
        } from '@angular/core';
            import { Element } from '@elemnt/angular';
            ${b(`import { forwardRef } from '@angular/core';
            import { NG_VALUE_ACCESSOR } from '@angular/forms'; 
            import { ElementValueAccessor } from '@elemnt/angular';`, component.accessor)}
            ${b(`import type { ${component.name} } from '${packageJson.name}';`, inputs?.length)}
            ${b(`import '${packageName}';`, register)}

            @Element(
                ${b(`{accessor: {event: "${component.accessor?.event}", prop: "${component.accessor?.prop}"}}`, component.accessor)}
            )

            @Component({
              selector: '${component.tagName}',
              changeDetection: ChangeDetectionStrategy.OnPush,
              template: '<ng-content></ng-content>'
              ${b(",standalone: true", standalone)}
              ${b(`,providers: [
                {
                  provide: NG_VALUE_ACCESSOR,
                  useExisting: forwardRef(() => ${className}),
                  multi: true,
                },
              ]`, component.accessor)}
            })
            export class ${className} ${component.accessor ? "extends ElementValueAccessor" : ""}{
              e = inject(ElementRef);
              z = inject(NgZone);

              ${v(inputs)}
            }

            ${standalone
            ? ngModule
                ? `@NgModule({
                        imports: [${className}],
                        exports: [${className}],
                    })
                    export class ${className}Module {}`
                : ""
            : `@NgModule({
                declarations: [${className}],
                exports: [${className}],
              })
              export class ${className}Module {}`}
        `;
}


function generateComponent(componentsPath: string, tagName: string, content: string) {
    // create folder for component
    mkdirp.sync(path.join(componentsPath, 'src'));
    // generate ng-package.json
    fs.writeFileSync(
        path.join(componentsPath, 'ng-package.json'),
        JSON.stringify({})
    );
    // create public-api.ts
    fs.writeFileSync(
        path.join(componentsPath, 'src', 'public_api.ts'),
        `export * from './${tagName}.component';`
    );
    // create component
    fs.writeFileSync(
        path.join(componentsPath, 'src', `${tagName}.component.ts`),
        prettier.format(content, { parser: "typescript" })
    );
}

export default function angular({
    exclude = [],
    outDir,
    packageMapper = (packageJson) => packageJson.name,
    accessors = [],
    standalone = true,
    ngModule = false,
    register = true,
}: PluginConfig) {
    return {
        name: "@elemnt/cem-plugin-angular",
        packageLinkPhase({ customElementsManifest }) {
            const components = getComponentsMetaData(customElementsManifest.modules, exclude, accessors);
            components.forEach((component) => {
                try {
                    const packageName = packageMapper(packageJson, component);
                    const componentsPath = path.join(outDir, `${component.tagName}`);
                    const content = getComponentCode(component, packageName, standalone, ngModule, register);
                    generateComponent(componentsPath, component.tagName, content);
                } catch (e) {
                    console.log(component.name)
                    console.log(e);
                }
            });
        },
    };
}

