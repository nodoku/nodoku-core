export type ComponentDef = {
    implementation: string;
    themeSchema: string;
    optionsSchema: string;
    defaultThemeFile: string;
    numBlocks: string | number;
};
export type Manifest = {
    moduleName: string;
    moduleDir: string;
    namespace?: string;
    components: Map<string, ComponentDef>;
};
