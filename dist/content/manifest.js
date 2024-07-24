export class ComponentDef {
    implementation;
    schemaFile;
    constructor(componentImplementation, componentSchema) {
        this.implementation = componentImplementation;
        this.schemaFile = componentSchema;
    }
}
export class Manifest {
    moduleName;
    namespace = undefined;
    components = new Map();
    constructor(moduleName) {
        this.moduleName = moduleName;
    }
}
