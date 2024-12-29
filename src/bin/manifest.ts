export type ComponentDef = {
    implementation: string;
    themeSchema: string;
    optionsSchema: string;
    defaultThemeFile: string;
    numBlocks: string | number;
    clientSideComps: string[];
}

export type Manifest = {
    moduleName: string;
    moduleDir: string;
    namespace?: string;
    components: Map<string, ComponentDef>;
}