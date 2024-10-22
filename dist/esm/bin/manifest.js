export class ComponentDef {
    implementation;
    themeSchema;
    optionsSchema;
    defaultThemeFile;
    numBlocks;
    constructor(componentImplementation, componentSchema, optionsSchema, defaultThemeFile, numBlocks) {
        this.implementation = componentImplementation;
        this.themeSchema = componentSchema;
        this.optionsSchema = optionsSchema;
        this.defaultThemeFile = defaultThemeFile;
        this.numBlocks = numBlocks;
    }
}
export class Manifest {
    moduleName;
    moduleDir;
    namespace = undefined;
    components = new Map();
    constructor(moduleName, moduleDir) {
        this.moduleName = moduleName;
        this.moduleDir = moduleDir;
    }
}
//# sourceMappingURL=manifest.js.map