import React, {JSX} from "react";
import {NdContentBlock} from "../content/nd-content";
import {
    NdComponentDefinition,
    NdContentSelector, NdDefaultThemeName,
    NdPageSkin,
    NdRow,
    NdSkinComponent,
    NdSkinComponentProps, NdThemeHierarchy
} from "../skin/nd-skin";
import {RenderingPageProps, RenderingPriority} from "./rendering-page-props";
import {AsyncFunctionComponent, ComponentProvider, I18nextProvider,} from "./providers";
import {DummyComp} from "./dummy-comp";
import yaml from "js-yaml";
import fs from "node:fs";

async function defaultComponentProvider(): Promise<{compo: AsyncFunctionComponent, compoDef: NdComponentDefinition}> {
    const compoDef: NdComponentDefinition = new NdComponentDefinition("unlimited", undefined, {});
    return {compo: DummyComp, compoDef: compoDef};
}

async function RenderingPage(props: RenderingPageProps): Promise<JSX.Element> {


    const {  lng , i18nextProvider, content, skin, renderingPriority} = props;
    var { componentProvider } = props;

    if (!componentProvider) {
        componentProvider = defaultComponentProvider;
    }

    let l: JSX.Element[][];
    if (skin) {

        let blockSkin: NdPageSkin = skin;

        if (renderingPriority == RenderingPriority.content_first) {
            blockSkin = generateSkinByContentBlocks(content, skin);
        }

        // console.log(" >>> this is my content <<< ", content)
        // console.log(" >>> this is my skin <<< ", JSON.stringify(blockSkin))


        l = await Promise.all(blockSkin.rows.map(async (row: NdRow, iRow: number): Promise<JSX.Element[]> =>
            await createSubRows(row, iRow, content, lng, i18nextProvider, componentProvider)
        ));

    } else {
        l = [await createSubRows(undefined, 0, content, lng, i18nextProvider, componentProvider)];
    }
    const rows: JSX.Element[] = l.flatMap((a: JSX.Element[]) => a);


    return <>{rows}</>

}

function generateSkinByContentBlocks(blocks: NdContentBlock[], skin: NdPageSkin): NdPageSkin {

    const rendered: Set<string> = new Set<string>();
    let currentRow: NdRow | undefined = undefined;
    const res: NdPageSkin = new NdPageSkin();

    let rowIndex = 0;
    blocks.map((b: NdContentBlock, i: number) => {
        if (!rendered.has(b.id)) {
            const bRows: NdRow[] = skin.rows.filter(r => r.row.filter(c => c.selector.match(b)).length > 0)
            if (bRows.length > 0) {
                if (currentRow) {
                    res.rows.push(currentRow);
                    currentRow = undefined;
                }
                bRows.forEach(r => res.rows.push(r))
                bRows.flatMap(r => r.row.flatMap(c => c.selector.filterBlocks(blocks)))
                    .forEach(b => rendered.add(b.id))

            } else {
                if (!currentRow) {
                    currentRow = new NdRow(res.rows.length)
                }
                currentRow.row.push(new NdSkinComponent(rowIndex, currentRow.row.length, "light",
                    new NdContentSelector([{key: "id", value: b.id}])));
                rendered.add(b.id);
            }
        }
    });

    if (currentRow) {
        res.rows.push(currentRow)
    }

    // console.log("generated skin", JSON.stringify(res))

    return res;

}

async function createSubRows(row: NdRow | undefined,
                             iRow: number,
                             blocks: NdContentBlock[],
                             lng: string,
                             i18nProvider: I18nextProvider,
                             componentProvider: ComponentProvider): Promise<JSX.Element[]> {

    let l: JSX.Element[][];
    if (row) {
        l = await Promise.all(row.row.map(async (visualSection: NdSkinComponent, iComp: number): Promise<JSX.Element[]> =>

            await createRowComponents(iRow, iComp, visualSection, blocks, lng, i18nProvider, componentProvider)

        ));
    } else {
        l = await Promise.all(blocks.map(async (block: NdContentBlock, iComp: number): Promise<JSX.Element[]> =>

            await createRowComponents(iRow, iComp, undefined, [block], lng, i18nProvider, componentProvider)

        ));
    }

    const rowComponents: JSX.Element[] = l.flatMap( (p: JSX.Element[]) => p);

    const numComponents = rowComponents.length;

    if (numComponents == 1) {
        return [rowComponents[0]];
    } else {
        const maxCols = 3;
        const numCols = numComponents <= maxCols  ? numComponents : maxCols;

        let gridCols: string = "grid-cols-1";
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

        const subRows: JSX.Element[] = [];
        for (var i = 0; i < numComponents / numCols; i++) {
            subRows.push(
                <div key={`row-${iRow}`} className={`grid ${gridCols} gap-4`}>
                    {rowComponents.slice(numCols * i, Math.min((i + 1) * numCols, numComponents))}
                </div>
            )

        }

        return subRows;
    }


}

async function createRowComponents(rowIndex: number,
                                   blockIndex: number,
                                   skinComponent: NdSkinComponent | undefined,
                                   pageContent: NdContentBlock[],
                                   lng: string,
                                   i18nProvider: I18nextProvider,
                                   componentProvider: ComponentProvider): Promise<JSX.Element[]> {


    // console.log("before component", skinComponent)

    const filteredBlocks: NdContentBlock[] = skinComponent ? skinComponent.selector.filterBlocks(pageContent) : pageContent;


    // console.log("retrieving comp", rowIndex, blockIndex, filteredBlocks.map(fb => JSON.stringify(fb.attributes)).join(", "));

    const {compo, compoDef} = await componentProvider(skinComponent ? skinComponent.componentName : "default");

    // console.log("start rendering comp", rowIndex, blockIndex, skinComponent);

    if (!compoDef.defaultTheme && compoDef.defaultThemeYaml) {
        compoDef.defaultTheme = yaml.load(fs.readFileSync(compoDef.defaultThemeYaml).toString());
    }

    const res: JSX.Element[] = []
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

            const blocks: NdContentBlock[] = filteredBlocks.slice(start, end);

            const compIndex = blockIndex * filteredBlocks.length + i;

            // console.log("calculated compo index ", compIndex, "filteredBlocks.length", filteredBlocks.length, "blockIndex", blockIndex)
            res.push(await renderSingleComponent(
                rowIndex,
                compIndex,
                compo,
                blocks,
                skinComponent?.defaultThemeName || "light",
                compoDef.defaultTheme,
                skinComponent?.themeHierarchy,
                lng,
                i18nProvider));

        }
        start = end;
        ++i;
    } while(end < filteredBlocks.length)

    return res;
}


async function renderSingleComponent(rowIndex: number,
                                     componentIndex: number,
                                     component: AsyncFunctionComponent,
                                     blocks: NdContentBlock[],
                                     defaultThemeName: NdDefaultThemeName,
                                     defaultTheme: any | undefined,
                                     themeHierarchy: NdThemeHierarchy | undefined,
                                     lng: string,
                                     i18nextProvider: I18nextProvider): Promise<JSX.Element> {

    let actualI18nextProvider: I18nextProvider = i18nextProvider

    const l = await i18nextProvider(lng)

    if (lng == blocks[0].lng) {
        actualI18nextProvider = async (lng: string): Promise<{t: (key: string, ns: string) => string}> => {

            return {t: (key: string, ns: string): string => {
                const b: string | undefined = blocks.map((b: NdContentBlock) => b.getByKey(key, ns)).find((s: string | undefined)  => s);
                return b ? b : `key not found: ${ns}:${key}`;
            }};
        }
    }


    if (themeHierarchy) {

        console.log("themeHierarchy", themeHierarchy)
    }

    const {effectiveTheme, effectiveThemes, effectiveOptions} =
        themeHierarchy?.calculateEffectiveTheme(componentIndex, defaultTheme) || {effectiveTheme: defaultTheme, effectiveThemes: [], effectiveOptions: {}};

    console.log(">>> ended themeHierarchy <<<")

    const props: NdSkinComponentProps = {
            rowIndex: rowIndex,
            componentIndex: componentIndex,
            content: blocks,
            defaultThemeName: defaultThemeName,
            theme: effectiveTheme,
            themes: effectiveThemes,
            options: effectiveOptions,
            lng: lng,
            i18nextProvider: actualI18nextProvider
    }

    // console.log("start rendering page with props", props);
    const res: JSX.Element = await component(props);
    // console.log("end rendering page with props", props);
    return res;
}

export {RenderingPage};