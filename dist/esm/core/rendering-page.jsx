import React from "react";
import { NdComponentDefinition, NdContentSelector, NdPageSkin, NdRow, NdSkinComponent } from "../skin/nd-skin";
import { RenderingPriority } from "./rendering-page-props";
import { DummyComp } from "./dummy-comp";
async function defaultComponentProvider() {
    const compoDef = new NdComponentDefinition("unlimited");
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
            blockSkin = generateSkinByContentBlocks(content.blocks, skin);
        }
        l = await Promise.all(blockSkin.rows.map(async (row, iRow) => {
            return await createSubRows(row, iRow, content.blocks, lng, i18nextProvider, componentProvider);
        }));
    }
    else {
        l = [await createSubRows(undefined, 0, content.blocks, lng, i18nextProvider, componentProvider)];
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
                currentRow.row.push(new NdSkinComponent(rowIndex, currentRow.row.length, new NdContentSelector([{ key: "id", value: b.id }])));
                rendered.add(b.id);
            }
        }
    });
    if (currentRow) {
        res.rows.push(currentRow);
    }
    return res;
}
async function createSubRows(row, iRow, blocks, lng, i18nProvider, componentProvider) {
    let l;
    if (row) {
        l = await Promise.all(row.row.map(async (visualSection, iComp) => {
            return await createRowComponents(iRow, iComp, visualSection, blocks, lng, i18nProvider, componentProvider);
        }));
    }
    else {
        l = await Promise.all(blocks.map(async (block, iComp) => {
            return await createRowComponents(iRow, iComp, undefined, [block], lng, i18nProvider, componentProvider);
        }));
    }
    const rowComponents = l.flatMap((p) => p);
    const numComponents = rowComponents.length;
    if (numComponents == 1) {
        return [rowComponents[0]];
    }
    else {
        const maxCols = 3;
        const numCols = numComponents <= maxCols ? numComponents : maxCols;
        const subRows = [];
        for (var i = 0; i < numComponents / numCols; i++) {
            subRows.push(<div key={`row-${iRow}`} className={`grid grid-cols-${numCols} gap-4 ${iRow == 0 ? "" : "mt-10"}`}>
                    {rowComponents.slice(numCols * i, Math.min((i + 1) * numCols, numComponents))}
                </div>);
        }
        return subRows;
    }
}
async function createRowComponents(rowIndex, blockIndex, skinComponent, pageContent, lng, i18nProvider, componentProvider) {
    console.log("before component", skinComponent);
    const filteredBlocks = skinComponent ? skinComponent.selector.filterBlocks(pageContent) : pageContent;
    console.log("retrieving comp", rowIndex, blockIndex);
    const { compo, compoDef } = await componentProvider(skinComponent ? skinComponent.componentName : "default");
    console.log("start rendering comp", rowIndex, blockIndex, skinComponent);
    const res = [];
    let start = 0;
    let end = filteredBlocks.length;
    do {
        if (typeof compoDef.numBlocks == "number") {
            end = Math.min(start + compoDef.numBlocks, filteredBlocks.length);
        }
        console.log("start rendering single component", skinComponent);
        console.log("single component start", start, end);
        if (start < end) {
            const blocks = filteredBlocks.slice(start, end);
            res.push(await renderSingleComponent(rowIndex, blockIndex, compo, blocks, skinComponent?.theme, skinComponent?.options, lng, i18nProvider));
        }
        start = end;
    } while (end < filteredBlocks.length);
    return res;
}
async function renderSingleComponent(rowIndex, componentIndex, component, blocks, theme, options, lng, i18nextProvider) {
    let actualI18nextProvider = i18nextProvider;
    const l = await i18nextProvider(lng);
    if (lng == blocks[0].lng) {
        actualI18nextProvider = async (lng) => {
            return { t: (key, ns) => {
                    const b = blocks.map((b) => b.getByKey(key)).find((s) => s);
                    if (b) {
                        return b;
                    }
                    return l.t(key, ns);
                } };
        };
    }
    const props = {
        rowIndex: rowIndex,
        componentIndex: componentIndex,
        content: blocks,
        theme: theme,
        options: options,
        lng: lng,
        i18nextProvider: actualI18nextProvider
    };
    console.log("start rendering page with props", props);
    const res = await component(props);
    console.log("end rendering page with props", props);
    return res;
}
export { RenderingPage };
