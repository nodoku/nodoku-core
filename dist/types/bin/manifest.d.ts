export declare class ComponentDef {
    implementation: string;
    schemaFile: string;
    numBlocks: string | number;
    constructor(componentImplementation: string, componentSchema: string, numBlocks: string | number);
}
export declare class Manifest {
    moduleName: string;
    moduleDir: string;
    namespace: string | undefined;
    components: Map<string, ComponentDef>;
    constructor(moduleName: string, moduleDir: string);
}
