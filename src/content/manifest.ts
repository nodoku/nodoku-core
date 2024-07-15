export class Manifest {
    moduleName: string
    componentName: string;
    componentImplementation: string;
    componentSchema: string;

    constructor(componentName: string, moduleName: string, componentImplementation: string, componentSchema: string) {
        this.componentName = componentName;
        this.moduleName = moduleName;
        this.componentImplementation = componentImplementation;
        this.componentSchema = componentSchema;
    }

    public static from(name: string, moduleName: string, json: any) {
        return new Manifest(name, moduleName, json.implementation, json.schema)
    }
}