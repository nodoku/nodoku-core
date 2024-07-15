import * as yaml from "js-yaml";
import React, {JSX} from "react";
import {
    LbComponentProps,
    LbContentBlock,
    LbContentImage, LbContentKey,
    LbNsContent,
    LbPageVisual,
    LbRow,
    LbTranslatedText,
    LbVisualComponent
} from "../content/lb-content-block";
import {RenderingPageProps} from "./rendering-page-props";
import {
    AsyncFunctionComponent,
    ComponentProvider,
    ContentYamlProvider,
    i18nextProvider,
    VisualYamlProvider
} from "../content/providers";
import {DummyComp} from "./dummy-comp";

async function defaultComponentProvider(componentName: string): Promise<AsyncFunctionComponent> {
    return DummyComp;
}


async function fetchPageContent(lng: string, namespaces: string[], provider: ContentYamlProvider): Promise<Map<string, LbNsContent>> {
    const pageContent: Map<string, LbNsContent> = new Map();
    await Promise.all(namespaces.map(ns => readFileContent(lng, ns, pageContent, provider)))
    // console.log("content", res)
    return pageContent;
}

async function readFileContent(lng: string, ns: string, pageContent: Map<string, LbNsContent>, provider: ContentYamlProvider): Promise<void> {
    console.log("fetching file content", lng, ns)
    await provider(lng, ns)
        .then((fileContent: any) => pageContent.set(ns, fetchSuccessContent(fileContent, ns)));

}

async function fetchPageVisual(pageName: string, provider: VisualYamlProvider): Promise<LbPageVisual> {
    const res = await provider(pageName)
        .then(fetchSuccessVisual);
    console.log("all visual", JSON.stringify(res))
    return res;
}

function fetchSuccessContent(fileContents: string, ns: string): LbNsContent {
    const data: any = yaml.load(fileContents);
    console.log("LbPageContent", Object.keys(data));

    const res: LbNsContent = new LbNsContent();

    res.blocks = Object.keys(data).map(((key: any, bi: number): LbContentBlock => {

        const b: any = data[key];

        const blockPrefix = key;
        const bRes: LbContentBlock = new LbContentBlock(key);

        bRes.title = new LbTranslatedText(ns);
        bRes.title.key = `${blockPrefix}.title`;
        bRes.title.text = b.header;

        bRes.subTitle = new LbTranslatedText(ns);
        bRes.subTitle.key = `${blockPrefix}.subTitle`;
        bRes.subTitle.text = b.subHeader;

        bRes.footer = new LbTranslatedText(ns);
        bRes.footer.key = `${blockPrefix}.footer`;
        bRes.footer.text = b.footer;

        bRes.paragraphs = b.paragraphs ? b.paragraphs.map(((p: any, pi: number) =>
                new LbTranslatedText(ns, `${key}.paragraphs.${pi}`, p)
        )) : [];

        bRes.images = b.images ? b.images.map(((im: any, imi: number) => {
            const pRes: LbContentImage = new LbContentImage();
            pRes.url = new LbTranslatedText(ns, `${key}.images.${imi}.url`, im.url);
            pRes.alt = new LbTranslatedText(ns, `${key}.images.${imi}.alt`, im.alt);
            pRes.title = new LbTranslatedText(ns, `${key}.images.${imi}.title`, im.title);
            return pRes;
        })) : [];

        if (b.bgImage) {
            bRes.bgImage = new LbContentImage();
            bRes.bgImage.url = new LbTranslatedText(ns, `${key}.bgImage.url`, b.bgImage.url);
            bRes.bgImage.alt = new LbTranslatedText(ns, `${key}.bgImage.alt`, b.bgImage.alt);
            bRes.bgImage.alt = new LbTranslatedText(ns, `${key}.bgImage.title`, b.bgImage.title);
        }

        return bRes;
    }))

    return res;
}

function fetchSuccessVisual(fileContents: string): LbPageVisual {
    const data: any = yaml.load(fileContents);

    return {
        rows: data.rows.map(((r: any, iRow: number) => {
            const row: LbRow = new LbRow(iRow);

            row.row = r.row.map((vc: any, iVc: number) => {

                console.log("Object.keys(vc)", Object.keys(vc))

                const vcName = Object.keys(vc)[0];
                const lbVisualComponent = new LbVisualComponent(iRow, iVc);
                lbVisualComponent.visualComponent = vcName;
                const vb: any = vc[lbVisualComponent.visualComponent]
                lbVisualComponent.ns = vb.ns;
                lbVisualComponent.contentKeys = convertContentKeys(vb, lbVisualComponent.ns);
                lbVisualComponent.theme = vb.theme
                lbVisualComponent.options = vb.options;

                lbVisualComponent.implementationModule = "nodoku-flowbite"
                lbVisualComponent.implementationComponent = lbVisualComponent.visualComponent;

                return lbVisualComponent;
            })

            return row;
        }))
    } as LbPageVisual;

}

function convertContentKeys(vb: any, defaultNs: string): LbContentKey[] {
    var contentKeys = vb.contentKeys
    if (!contentKeys && vb.contentKey) {
        contentKeys = [vb.contentKey]
    }
    if (!contentKeys || !contentKeys.length) {
        return []
    }
    return contentKeys.map((ck: any) => {
        if (typeof ck == "string") {
            return new LbContentKey(ck, defaultNs);
        } else {
            return new LbContentKey(ck.key, ck.ns ? ck.ns : defaultNs);
        }
    })
}

async function RenderingPage(props: RenderingPageProps): Promise<JSX.Element> {


    const { pageName, lng , i18nextProvider, contentYamlProvider, visualYamlProvider} = props;
    var { componentProvider } = props;

    if (!componentProvider) {
        componentProvider = defaultComponentProvider;
    }

    const pageVisual: LbPageVisual = await fetchPageVisual(pageName, visualYamlProvider);

    const namespaces: Set<string> = new Set();

    pageVisual.rows.forEach((r: any) => {
        r.row.forEach((vc: any) => {
            vc.contentKeys.forEach((ck: any) => {
                console.log(ck.ns)
                namespaces.add(ck.ns);
            })
        })
    })

    const pageContent: Map<string, LbNsContent> = await fetchPageContent(lng, Array.from(namespaces.keys()), contentYamlProvider);

    const l: JSX.Element[][] = await Promise.all(pageVisual.rows.map(async (row: LbRow, iRow: number): Promise<JSX.Element[]> => {
        return await createSubRows(row, iRow, pageContent, lng, i18nextProvider, componentProvider)

    }));
    const rows: JSX.Element[] = l.flatMap((a: JSX.Element[]) => a);


    return <>{rows}</>

}

async function createSubRows(row: LbRow, iRow: number, pageContent: Map<string, LbNsContent>, lng: string, i18nProvider: i18nextProvider, componentProvider: ComponentProvider): Promise<JSX.Element[]> {

    const rowComponents: JSX.Element[] = await Promise.all(row.row.map(async (visualSection: LbVisualComponent, iComp: number): Promise<JSX.Element> => {

        return await createRowBlock(iRow, iComp, visualSection, pageContent, lng, i18nProvider, componentProvider)

    }));

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

async function createRowBlock(rowIndex: number,
                              componentIndex: number,
                              visualSection: LbVisualComponent,
                              pageContent: Map<string, LbNsContent>,
                              lng: string,
                              i18nProvider: i18nextProvider,
                              componentProvider: ComponentProvider): Promise<JSX.Element> {

    const blocks: LbContentBlock[] =
        visualSection.contentKeys
            .map((k: any) => pageContent.get(k.ns)?.blocks.find((b: LbContentBlock) => b.key == k.key))
            .filter((b: any) => b != undefined)
            .map((b: any) => b as LbContentBlock)

    console.log("retrieving comp", rowIndex, componentIndex);

    const component: AsyncFunctionComponent = await componentProvider(visualSection.implementationComponent)

    console.log("after component")

    return renderWithVisual(rowIndex, componentIndex, component, blocks, visualSection, lng, i18nProvider);

}


async function renderWithVisual(rowIndex: number,
                          componentIndex: number,
                          component: AsyncFunctionComponent,
                          section: LbContentBlock[],
                          visualSection: LbVisualComponent,
                          lng: string,
                          i18nextProvider: i18nextProvider): Promise<JSX.Element> {


    console.log("start rendering page");

    const props: LbComponentProps = {
            rowIndex: rowIndex,
            componentIndex: componentIndex,
            content: section,
            visual: visualSection.theme,
            options: visualSection.options,
            lng: lng,
            i18nextProvider: i18nextProvider
    }
    return await component(props);
}

export {RenderingPage};