export class ComponentDef {
    implementation: string;
    themeSchema: string;
    optionsSchema: string;
    defaultThemeFile: string;
    numBlocks: string | number;

    constructor(componentImplementation: string,
                componentSchema: string,
                optionsSchema: string,
                defaultThemeFile: string,
                numBlocks: string | number) {

        this.implementation = componentImplementation;
        this.themeSchema = componentSchema;
        this.optionsSchema = optionsSchema;
        this.defaultThemeFile = defaultThemeFile;
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