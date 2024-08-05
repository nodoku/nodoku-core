export class ComponentDef {
    implementation;
    schemaFile;
    numBlocks;
    constructor(componentImplementation, componentSchema, numBlocks) {
        this.implementation = componentImplementation;
        this.schemaFile = componentSchema;
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
