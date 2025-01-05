import yaml from "js-yaml";
import {NdContentSelector, NdPageSkin, NdRow, NdSkinComponent, NdThemeHierarchy} from "../../skin/nd-skin";
import {ThemeStyle} from "../../theme-utils/theme-style";

export async function skinYamlProvider(yamlFileUrl: string): Promise<NdPageSkin> {
    return await fetch(yamlFileUrl)
        .then(response => response.text())
        .then(parseYamlContentAsSkin);
}

interface LooseObject {
    [key: string]: any
}

export function parseYamlContentAsSkin(fileContents: string): NdPageSkin {
    const data: any = yaml.load(fileContents);

    if (!data) {
        return new NdPageSkin();
    }

    let defaultThemeName: "light" | "dark" = "light"
    let globalTheme: LooseObject = {};
    let globalThemes: LooseObject[] = [];
    let componentTheme: {[key: string]: {theme: LooseObject, themes: LooseObject[], options: LooseObject}} = {};
    let renderingPage: ThemeStyle | undefined = undefined;

    if (data.global) {
        defaultThemeName = data.global.defaultTheme || defaultThemeName
        globalTheme = data.global.theme;
        globalThemes = data.global.themes;
        componentTheme = data.global.components;
        renderingPage = data.global.renderingPage;
    }

    return data.rows ? {
        renderingPage: renderingPage,
        rows: data.rows.map(((r: any, iRow: number) => {
            const row: NdRow = new NdRow(iRow);
            row.theme = r.row.theme;
            row.maxCols = r.row.maxCols;
            row.components = r.row.components.map((vc: any, iVc: number) => {

                const vcName = Object.keys(vc)[0];
                const vb: any = vc[vcName]
                const lbVisualComponent = new NdSkinComponent(iRow, iVc, defaultThemeName, vb.selector);

                lbVisualComponent.themeHierarchy = new NdThemeHierarchy(defaultThemeName);
                lbVisualComponent.themeHierarchy.globalTheme = globalTheme;
                lbVisualComponent.themeHierarchy.globalThemes = globalThemes?.slice();
                lbVisualComponent.themeHierarchy.componentOptions = componentTheme ? componentTheme[vcName]?.options : undefined;
                lbVisualComponent.themeHierarchy.componentTheme = componentTheme ? componentTheme[vcName]?.theme : undefined;
                lbVisualComponent.themeHierarchy.componentThemes = componentTheme ? componentTheme[vcName]?.themes?.slice() : undefined;
                lbVisualComponent.themeHierarchy.theme = vb.theme
                lbVisualComponent.themeHierarchy.themes = vb.themes?.slice();
                lbVisualComponent.themeHierarchy.options = vb.options;

                lbVisualComponent.componentName = vcName;

                const attributes = vb.selector.attributes ?
                    Object.keys(vb.selector.attributes).map(a => {return {key: a, value: vb.selector.attributes[a]}}) :
                    [];
                const tags = vb.selector.tags ? vb.selector.tags : [];

                // console.log("NdContentSelector attributes", attributes, "tags", tags)

                lbVisualComponent.selector = new NdContentSelector(attributes, tags)

                return lbVisualComponent;
            })

            return row;
        }))
    } as NdPageSkin : {renderingPage: renderingPage, rows: []} as NdPageSkin;

}

