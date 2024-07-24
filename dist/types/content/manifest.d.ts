export declare class ComponentDef {
    implementation: string;
    schemaFile: string;
    constructor(componentImplementation: string, componentSchema: string);
}
export declare class Manifest {
    moduleName: string;
    namespace: string | undefined;
    components: Map<string, ComponentDef>;
    constructor(moduleName: string);
}
