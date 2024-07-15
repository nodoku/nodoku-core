export class ComponentDef {
    componentImplementation: string;
    componentSchema: string;

    constructor(componentImplementation: string, componentSchema: string) {
        this.componentImplementation = componentImplementation;
        this.componentSchema = componentSchema;
    }

}

export class Manifest {
    moduleName: string
    components: Map<string, ComponentDef> = new Map<string, ComponentDef>();

    constructor(moduleName: string) {
        this.moduleName = moduleName;
    }
}