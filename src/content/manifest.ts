export class ComponentDef {
    implementation: string;
    schemaFile: string;

    constructor(componentImplementation: string, componentSchema: string) {
        this.implementation = componentImplementation;
        this.schemaFile = componentSchema;
    }

}

export class Manifest {
    moduleName: string
    namespace: string | undefined = undefined;
    components: Map<string, ComponentDef> = new Map<string, ComponentDef>();

    constructor(moduleName: string) {
        this.moduleName = moduleName;
    }
}