export class ComponentDef {
    implementation: string;
    schemaFile: string;
    numBlocks: string | number;

    constructor(componentImplementation: string, componentSchema: string, numBlocks: string | number) {
        this.implementation = componentImplementation;
        this.schemaFile = componentSchema;
        this.numBlocks = numBlocks;
    }

}

export class Manifest {
    moduleName: string
    moduleDir: string
    namespace: string | undefined = undefined;
    components: Map<string, ComponentDef> = new Map<string, ComponentDef>();

    constructor(moduleName: string, moduleDir: string) {
        this.moduleName = moduleName;
        this.moduleDir = moduleDir;
    }
}