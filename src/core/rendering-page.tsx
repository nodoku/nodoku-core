import React, {JSX} from "react";
import {NdContent, NdContentBlock,} from "../content/nd-content";
import {
    NdComponentDefinition,
    NdContentSelector,
    NdPageSkin,
    NdRow,
    NdSkinComponent,
    NdSkinComponentProps
} from "../skin/nd-skin";
import {RenderingPageProps, RenderingPriority} from "./rendering-page-props";
import {AsyncFunctionComponent, ComponentProvider, i18nextProvider,} from "./providers";
import {DummyComp} from "./dummy-comp";

async function defaultComponentProvider(): Promise<{compo: AsyncFunctionComponent, compoDef: NdComponentDefinition}> {
    const compoDef: NdComponentDefinition = new NdComponentDefinition("unlimited");
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
            blockSkin = generateSkinByContentBlocks(content.blocks, skin, componentProvider);
        }

        l = await Promise.all(blockSkin.rows.map(async (row: NdRow, iRow: number): Promise<JSX.Element[]> => {
            return await createSubRows(row, iRow, content.blocks, lng, i18nextProvider, componentProvider)
        }));

    } else {
        l = [await createSubRows(undefined, 0, content.blocks, lng, i18nextProvider, componentProvider)];
    }
    const rows: JSX.Element[] = l.flatMap((a: JSX.Element[]) => a);


    return <>{rows}</>

}

function generateSkinByContentBlocks(blocks: NdContentBlock[], skin: NdPageSkin, componentProvider: ComponentProvider): NdPageSkin {

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
                currentRow.row.push(new NdSkinComponent(rowIndex, currentRow.row.length, new NdContentSelector([{key: "id", value: b.id}])));
                rendered.add(b.id);
            }
        }
    });

    if (currentRow) {
        res.rows.push(currentRow)
    }

    return res;

}

async function createSubRows(row: NdRow | undefined, iRow: number, blocks: NdContentBlock[], lng: string, i18nProvider: i18nextProvider, componentProvider: ComponentProvider): Promise<JSX.Element[]> {

    let l: JSX.Element[][];
    if (row) {
        l = await Promise.all(row.row.map(async (visualSection: NdSkinComponent, iComp: number): Promise<JSX.Element[]> => {

            return await createRowComponents(iRow, iComp, visualSection, blocks, lng, i18nProvider, componentProvider)

        }));
    } else {
        l = await Promise.all(blocks.map(async (block: NdContentBlock, iComp: number): Promise<JSX.Element[]> => {

            return await createRowComponents(iRow, iComp, undefined, [block], lng, i18nProvider, componentProvider)

        }));
    }

    const rowComponents: JSX.Element[] = l.flatMap( (p: JSX.Element[]) => p);

    const numComponents = rowComponents.length;

    if (numComponents == 1) {
        return [rowComponents[0]];
    } else {
        const maxCols = 3;
        const numCols = numComponents <= maxCols  ? numComponents : maxCols;


        const subRows: JSX.Element[] = [];
        for (var i = 0; i < numComponents / numCols; i++) {
            subRows.push(
                <div key={`row-${iRow}`} className={`grid grid-cols-${numCols} gap-4 ${iRow == 0 ? "" : "mt-10"}`}>
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
                                   i18nProvider: i18nextProvider,
                                   componentProvider: ComponentProvider): Promise<JSX.Element[]> {


    console.log("before component", skinComponent)

    const filteredBlocks: NdContentBlock[] = skinComponent ? skinComponent.selector.filterBlocks(pageContent) : pageContent;


    console.log("retrieving comp", rowIndex, blockIndex);

    const {compo, compoDef} = await componentProvider(skinComponent ? skinComponent.componentName : "default");

    console.log("start rendering comp", rowIndex, blockIndex, skinComponent);

    const res: JSX.Element[] = []
    let start = 0;
    let end = filteredBlocks.length;
    do {
        if (typeof compoDef.numBlocks == "number") {
            end = Math.min(start + compoDef.numBlocks, filteredBlocks.length);
        }

        console.log("start rendering single component", skinComponent)
        console.log("single component start", start, end)

        if (start < end) {

            const blocks: NdContentBlock[] = filteredBlocks.slice(start, end);

            res.push(await renderSingleComponent(rowIndex, blockIndex, compo, blocks, skinComponent?.theme, skinComponent?.options, lng, i18nProvider));

        }
        start = end;
    } while(end < filteredBlocks.length)

    return res;
}


async function renderSingleComponent(rowIndex: number,
                                componentIndex: number,
                                component: AsyncFunctionComponent,
                                section: NdContentBlock[],
                                // visualSection: NdSkinComponent,
                                theme: any,
                                options: any,
                                lng: string,
                                i18nextProvider: i18nextProvider): Promise<JSX.Element> {


    const props: NdSkinComponentProps = {
            rowIndex: rowIndex,
            componentIndex: componentIndex,
            content: section,
            theme: theme,
            options: options,
            lng: lng,
            i18nextProvider: i18nextProvider
    }

    console.log("start rendering page with props", props);
    const res: JSX.Element = await component(props);
    console.log("end rendering page with props", props);
    return res;
}

export {RenderingPage};