import yaml from "js-yaml";
import { NdContentSelector, NdPageSkin, NdRow, NdSkinComponent, NdThemeHierarchy } from "../../skin/nd-skin";
export async function skinYamlProvider(yamlFileUrl) {
    return await fetch(yamlFileUrl)
        .then(response => response.text())
        .then(parseYamlContentAsSkin);
}
export function parseYamlContentAsSkin(fileContents) {
    const data = yaml.load(fileContents);
    if (!data) {
        return new NdPageSkin();
    }
    let defaultThemeName = "light";
    let globalTheme = {};
    let globalThemes = [];
    let componentTheme = {};
    let renderingPage = undefined;
    if (data.global) {
        defaultThemeName = data.global.defaultTheme || defaultThemeName;
        globalTheme = data.global.theme;
        globalThemes = data.global.themes;
        componentTheme = data.global.components;
        renderingPage = data.global.renderingPage;
    }
    return data.rows ? {
        renderingPage: renderingPage,
        rows: data.rows.map(((r, iRow) => {
            const row = new NdRow(iRow);
            row.theme = r.row.theme;
            row.maxCols = r.row.maxCols;
            row.components = r.row.components.map((vc, iVc) => {
                const vcName = Object.keys(vc)[0];
                const vb = vc[vcName];
                const lbVisualComponent = new NdSkinComponent(iRow, iVc, defaultThemeName, vb.selector);
                lbVisualComponent.themeHierarchy = new NdThemeHierarchy(defaultThemeName);
                lbVisualComponent.themeHierarchy.globalTheme = globalTheme;
                lbVisualComponent.themeHierarchy.globalThemes = globalThemes?.slice();
                lbVisualComponent.themeHierarchy.componentOptions = componentTheme ? componentTheme[vcName]?.options : undefined;
                lbVisualComponent.themeHierarchy.componentTheme = componentTheme ? componentTheme[vcName]?.theme : undefined;
                lbVisualComponent.themeHierarchy.componentThemes = componentTheme ? componentTheme[vcName]?.themes?.slice() : undefined;
                lbVisualComponent.themeHierarchy.theme = vb.theme;
                lbVisualComponent.themeHierarchy.themes = vb.themes?.slice();
                lbVisualComponent.componentName = vcName;
                const attributes = vb.selector.attributes ?
                    Object.keys(vb.selector.attributes).map(a => { return { key: a, value: vb.selector.attributes[a] }; }) :
                    [];
                const tags = vb.selector.tags ? vb.selector.tags : [];
                // console.log("NdContentSelector attributes", attributes, "tags", tags)
                lbVisualComponent.selector = new NdContentSelector(attributes, tags);
                return lbVisualComponent;
            });
            return row;
        }))
    } : { renderingPage: renderingPage, rows: [] };
}
