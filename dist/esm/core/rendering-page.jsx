import React from "react";
import { NdComponentDefinition, NdContentSelector, NdPageSkin, NdRow, NdSkinComponent } from "../skin/nd-skin";
import { RenderingPriority } from "./rendering-page-props";
import { DummyComp } from "./dummy-comp";
import yaml from "js-yaml";
import fs from "node:fs";
async function defaultComponentProvider() {
    const compoDef = new NdComponentDefinition("unlimited", undefined, {});
    return { compo: DummyComp, compoDef: compoDef };
}
async function RenderingPage(props) {
    const { lng, i18nextProvider, content, skin, renderingPriority } = props;
    var { componentProvider } = props;
    if (!componentProvider) {
        componentProvider = defaultComponentProvider;
    }
    let l;
    if (skin) {
        let blockSkin = skin;
        if (renderingPriority == RenderingPriority.content_first) {
            blockSkin = generateSkinByContentBlocks(content, skin);
        }
        // console.log(" >>> this is my content <<< ", content)
        // console.log(" >>> this is my skin <<< ", JSON.stringify(blockSkin))
        l = await Promise.all(blockSkin.rows.map(async (row, iRow) => await createSubRows(row, iRow, content, lng, i18nextProvider, componentProvider)));
    }
    else {
        l = [await createSubRows(undefined, 0, content, lng, i18nextProvider, componentProvider)];
    }
    const rows = l.flatMap((a) => a);
    return <>{rows}</>;
}
function generateSkinByContentBlocks(blocks, skin) {
    const rendered = new Set();
    let currentRow = undefined;
    const res = new NdPageSkin();
    let rowIndex = 0;
    blocks.map((b, i) => {
        if (!rendered.has(b.id)) {
            const bRows = skin.rows.filter(r => r.row.filter(c => c.selector.match(b)).length > 0);
            if (bRows.length > 0) {
                if (currentRow) {
                    res.rows.push(currentRow);
                    currentRow = undefined;
                }
                bRows.forEach(r => res.rows.push(r));
                bRows.flatMap(r => r.row.flatMap(c => c.selector.filterBlocks(blocks)))
                    .forEach(b => rendered.add(b.id));
            }
            else {
                if (!currentRow) {
                    currentRow = new NdRow(res.rows.length);
                }
                currentRow.row.push(new NdSkinComponent(rowIndex, currentRow.row.length, "light", new NdContentSelector([{ key: "id", value: b.id }])));
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
async function createSubRows(row, iRow, blocks, lng, i18nProvider, componentProvider) {
    let l;
    if (row) {
        l = await Promise.all(row.row.map(async (visualSection, iComp) => await createRowComponents(iRow, iComp, visualSection, blocks, lng, i18nProvider, componentProvider)));
    }
    else {
        l = await Promise.all(blocks.map(async (block, iComp) => await createRowComponents(iRow, iComp, undefined, [block], lng, i18nProvider, componentProvider)));
    }
    const rowComponents = l.flatMap((p) => p);
    const numComponents = rowComponents.length;
    if (numComponents == 1) {
        return [rowComponents[0]];
    }
    else {
        const maxCols = 3;
        const numCols = numComponents <= maxCols ? numComponents : maxCols;
        let gridCols = "grid-cols-1";
        switch (numCols) {
            case 1:
                gridCols = "grid-cols-1";
                break;
            case 2:
                gridCols = "grid-cols-2";
                break;
            case 3:
                gridCols = "grid-cols-3";
                break;
        }
        const subRows = [];
        for (var i = 0; i < numComponents / numCols; i++) {
            subRows.push(<div key={`row-${iRow}`} className={`grid ${gridCols} gap-4`}>
                    {rowComponents.slice(numCols * i, Math.min((i + 1) * numCols, numComponents))}
                </div>);
        }
        return subRows;
    }
}
async function createRowComponents(rowIndex, blockIndex, skinComponent, pageContent, lng, i18nProvider, componentProvider) {
    // console.log("before component", skinComponent)
    const filteredBlocks = skinComponent ? skinComponent.selector.filterBlocks(pageContent) : pageContent;
    // console.log("retrieving comp", rowIndex, blockIndex, filteredBlocks.map(fb => JSON.stringify(fb.attributes)).join(", "));
    const { compo, compoDef } = await componentProvider(skinComponent ? skinComponent.componentName : "default");
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
            res.push(await renderSingleComponent(rowIndex, compIndex, compo, blocks, skinComponent?.defaultThemeName || "light", compoDef.defaultTheme, skinComponent?.themeHierarchy, lng, i18nProvider));
        }
        start = end;
        ++i;
    } while (end < filteredBlocks.length);
    return res;
}
async function renderSingleComponent(rowIndex, componentIndex, component, blocks, defaultThemeName, defaultTheme, themeHierarchy, lng, i18nextProvider) {
    let actualI18nextProvider = i18nextProvider;
    const l = await i18nextProvider(lng);
    if (lng == blocks[0].lng) {
        actualI18nextProvider = async (lng) => {
            return { t: (key, ns) => {
                    const b = blocks.map((b) => b.getByKey(key, ns)).find((s) => s);
                    return b ? b : `key not found: ${ns}:${key}`;
                } };
        };
    }
    if (themeHierarchy) {
        console.log("themeHierarchy", themeHierarchy);
    }
    const { effectiveTheme, effectiveThemes, effectiveOptions } = themeHierarchy?.calculateEffectiveTheme(componentIndex, defaultTheme) || { effectiveTheme: defaultTheme, effectiveThemes: [], effectiveOptions: {} };
    console.log(">>> ended themeHierarchy <<<");
    const props = {
        rowIndex: rowIndex,
        componentIndex: componentIndex,
        content: blocks,
        defaultThemeName: defaultThemeName,
        theme: effectiveTheme,
        themes: effectiveThemes,
        options: effectiveOptions,
        lng: lng,
        i18nextProvider: actualI18nextProvider
    };
    // console.log("start rendering page with props", props);
    const res = await component(props);
    // console.log("end rendering page with props", props);
    return res;
}
export { RenderingPage };
