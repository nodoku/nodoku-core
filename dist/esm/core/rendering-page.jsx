import React from "react";
import { NdComponentDefinition, NdContentSelector, NdPageSkin, NdRow, NdSkinComponent } from "../skin/nd-skin";
import { RenderingPriority } from "./rendering-page-props";
import { DummyComp } from "./dummy-comp";
import yaml from "js-yaml";
import fs from "node:fs";
import { mergeTheme } from "../theme-utils/theme-merger";
async function defaultComponentResolver() {
    const compoDef = new NdComponentDefinition("unlimited", undefined, {});
    return { compo: DummyComp, compoDef: compoDef };
}
async function defaultImageUrlProvider(imageUrl) {
    return imageUrl;
}
async function RenderingPage(props) {
    const { lng, renderingPriority, content, componentResolver, skin, imageUrlProvider, i18nextProvider } = props;
    const actualComponentResolver = componentResolver ? componentResolver : defaultComponentResolver;
    let l;
    if (skin) {
        let blockSkin = skin;
        if (renderingPriority == RenderingPriority.content_first) {
            blockSkin = generateSkinByContentBlocks(content, skin);
        }
        // console.log(" >>> this is my content <<< ", content)
        // console.log(" >>> this is my skin <<< ", JSON.stringify(blockSkin))
        l = await Promise.all(blockSkin.rows.map(async (row, iRow) => await createRow(row, iRow, content, lng, imageUrlProvider, i18nextProvider, actualComponentResolver)));
    }
    else {
        l = [await createRow(undefined, 0, content, lng, imageUrlProvider, i18nextProvider, actualComponentResolver)];
    }
    return <div className={`${skin?.renderingPage?.base} ${skin?.renderingPage?.decoration}`}>{l}</div>;
}
function generateSkinByContentBlocks(blocks, skin) {
    const rendered = new Set();
    let currentRow = undefined;
    const res = new NdPageSkin();
    let rowIndex = 0;
    blocks.map((b, i) => {
        if (!rendered.has(b.id)) {
            const bRows = skin.rows.filter(r => r.components.filter(c => c.selector.match(b)).length > 0);
            if (bRows.length > 0) {
                if (currentRow) {
                    res.rows.push(currentRow);
                    currentRow = undefined;
                }
                bRows.forEach(r => res.rows.push(r));
                bRows.flatMap(r => r.components.flatMap(c => c.selector.filterBlocks(blocks)))
                    .forEach(b => rendered.add(b.id));
            }
            else {
                if (!currentRow) {
                    currentRow = new NdRow(res.rows.length);
                }
                currentRow.components.push(new NdSkinComponent(rowIndex, currentRow.components.length, "light", new NdContentSelector([{ key: "id", value: b.id }])));
                rendered.add(b.id);
            }
        }
    });
    if (currentRow) {
        res.rows.push(currentRow);
    }
    // console.log("generated skin", JSON.stringify(res))
    return res;
}
async function createRow(row, iRow, blocks, lng, imageUrlProvider, i18nProvider, componentResolver) {
    let l;
    if (row) {
        l = await Promise.all(row.components.map(async (visualSection, iComp) => await createRowComponents(iRow, iComp, visualSection, blocks, lng, imageUrlProvider, i18nProvider, componentResolver)));
    }
    else {
        l = await Promise.all(blocks.map(async (block, iComp) => await createRowComponents(iRow, iComp, undefined, [block], lng, imageUrlProvider, i18nProvider, componentResolver)));
    }
    const rowComponents = l.flatMap((p) => p);
    const numComponents = rowComponents.length;
    const rowEffectiveTheme = mergeTheme(row?.theme, NdRow.defaultRowTheme);
    const maxCols = row?.maxCols ? row.maxCols : 3;
    const numCols = numComponents <= maxCols ? numComponents : maxCols;
    let gridCols = "grid-cols-1";
    switch (numCols) {
        case 1:
            gridCols = "lg:grid-cols-1";
            break;
        case 2:
            gridCols = "lg:grid-cols-2";
            break;
        case 3:
            gridCols = "lg:grid-cols-3";
            break;
        case 4:
            gridCols = "lg:grid-cols-4";
            break;
        case 5:
            gridCols = "lg:grid-cols-5";
            break;
        case 6:
            gridCols = "lg:grid-cols-6";
            break;
        case 7:
            gridCols = "lg:grid-cols-7";
            break;
        case 8:
            gridCols = "lg:grid-cols-8";
            break;
        case 9:
            gridCols = "lg:grid-cols-9";
            break;
        case 10:
            gridCols = "lg:grid-cols-10";
            break;
        case 11:
            gridCols = "lg:grid-cols-11";
            break;
        case 12:
            gridCols = "lg:grid-cols-12";
            break;
    }
    return (<div key={`row-${iRow}`} className={`grid ${gridCols} ${rowEffectiveTheme?.base} ${rowEffectiveTheme?.decoration} class-row-${iRow}`}>
            {rowComponents}
        </div>);
}
async function createRowComponents(rowIndex, blockIndex, skinComponent, pageContent, lng, imageUrlProvide, i18nProvider, componentResolver) {
    // console.log("before component", skinComponent)
    const filteredBlocks = skinComponent ? skinComponent.selector.filterBlocks(pageContent) : pageContent;
    // console.log("retrieving comp", rowIndex, blockIndex, filteredBlocks.map(fb => JSON.stringify(fb.attributes)).join(", "));
    const { compo, compoDef } = await componentResolver(skinComponent ? skinComponent.componentName : "default");
    // console.log("start rendering comp", rowIndex, blockIndex, skinComponent);
    if (!compoDef.defaultTheme && compoDef.defaultThemeYaml) {
        compoDef.defaultTheme = yaml.load(fs.readFileSync(compoDef.defaultThemeYaml).toString());
    }
    const res = [];
    let start = 0;
    let end = filteredBlocks.length;
    let i = 0;
    do {
        if (typeof compoDef.numBlocks == "number") {
            end = Math.min(start + compoDef.numBlocks, filteredBlocks.length);
        }
        // console.log("start rendering single component", skinComponent)
        // console.log("single component start", start, end)
        if (start < end) {
            const blocks = filteredBlocks.slice(start, end);
            const compIndex = blockIndex * filteredBlocks.length + i;
            // console.log("calculated compo index ", compIndex, "filteredBlocks.length", filteredBlocks.length, "blockIndex", blockIndex)
            res.push(await renderSingleComponent(rowIndex, compIndex, compo, blocks, skinComponent?.defaultThemeName || "light", compoDef.defaultTheme, skinComponent?.themeHierarchy, lng, imageUrlProvide, i18nProvider));
        }
        start = end;
        ++i;
    } while (end < filteredBlocks.length);
    return res;
}
async function renderSingleComponent(rowIndex, componentIndex, component, blocks, defaultThemeName, defaultTheme, themeHierarchy, lng, imageUrlProvider, i18nextProvider) {
    let actualI18nextProvider;
    if (lng == blocks[0].lng || !i18nextProvider) {
        actualI18nextProvider = async (lng) => {
            return { t: (text) => {
                    const b = blocks.map((b) => b.getByKey(text.key, text.ns)).find((s) => s);
                    return b ? b : `key not found: ${text.ns}:${text.key}`;
                } };
        };
    }
    else {
        actualI18nextProvider = i18nextProvider;
    }
    const actualImageUrlProvider = imageUrlProvider ? imageUrlProvider : defaultImageUrlProvider;
    // if (themeHierarchy) {
    //     console.log("themeHierarchy", themeHierarchy)
    // }
    const { effectiveTheme, effectiveThemes, effectiveOptions } = themeHierarchy?.calculateEffectiveTheme(componentIndex, defaultTheme) || { effectiveTheme: defaultTheme, effectiveThemes: [], effectiveOptions: {} };
    // console.log(">>> ended themeHierarchy <<<")
    const props = {
        rowIndex: rowIndex,
        componentIndex: componentIndex,
        content: blocks,
        defaultThemeName: defaultThemeName,
        theme: effectiveTheme,
        themes: effectiveThemes,
        options: effectiveOptions,
        lng: lng,
        imageUrlProvider: actualImageUrlProvider,
        i18nextProvider: actualI18nextProvider
    };
    // console.log("start rendering page with props", props);
    const res = await component(props);
    // console.log("end rendering page with props", props);
    return res;
}
export { RenderingPage };
//# sourceMappingURL=rendering-page.jsx.map