import angular from '@elemnt/cem-plugin-angular';

export default {
    globs: ['src/**/*.ts'],
    outdir: 'dist',
    litelement: true,
    plugins: [
        angular({
            outDir: '../ng-lib/',
            standalone: true,
            ngModule: false,
            accessors: [{
                event: "input",
                prop: "value",
                elements: ["ui-text"],
            }],
            packageMapper: (packageJson, component) => {
                return packageJson.name + `/${component.name.toLowerCase()}.js`
            }
        })
    ]
}