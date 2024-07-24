import * as yaml from "js-yaml";
import React from "react";
import { LbContentBlock, LbContentImage, LbContentKey, LbNsContent, LbRow, LbTranslatedText, LbVisualComponent } from "../content/lb-content-block";
import { DummyComp } from "./dummy-comp";
async function defaultComponentProvider(componentName) {
    return DummyComp;
}
async function fetchPageContent(lng, namespaces, provider) {
    const pageContent = new Map();
    await Promise.all(namespaces.map(ns => readFileContent(lng, ns, pageContent, provider)));
    // console.log("content", res)
    return pageContent;
}
async function readFileContent(lng, ns, pageContent, provider) {
    console.log("fetching file content", lng, ns);
    await provider(lng, ns)
        .then((fileContent) => pageContent.set(ns, fetchSuccessContent(fileContent, ns)));
}
async function fetchPageVisual(pageName, provider) {
    const res = await provider(pageName)
        .then(fetchSuccessVisual);
    console.log("all visual", JSON.stringify(res));
    return res;
}
function fetchSuccessContent(fileContents, ns) {
    const data = yaml.load(fileContents);
    console.log("LbPageContent", Object.keys(data));
    const res = new LbNsContent();
    res.blocks = Object.keys(data).map(((key, bi) => {
        const b = data[key];
        const blockPrefix = key;
        const bRes = new LbContentBlock(key);
        bRes.title = new LbTranslatedText(ns);
        bRes.title.key = `${blockPrefix}.title`;
        bRes.title.text = b.header;
        bRes.subTitle = new LbTranslatedText(ns);
        bRes.subTitle.key = `${blockPrefix}.subTitle`;
        bRes.subTitle.text = b.subHeader;
        bRes.footer = new LbTranslatedText(ns);
        bRes.footer.key = `${blockPrefix}.footer`;
        bRes.footer.text = b.footer;
        bRes.paragraphs = b.paragraphs ? b.paragraphs.map(((p, pi) => new LbTranslatedText(ns, `${key}.paragraphs.${pi}`, p))) : [];
        bRes.images = b.images ? b.images.map(((im, imi) => {
            const pRes = new LbContentImage();
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
    }));
    return res;
}
function fetchSuccessVisual(fileContents) {
    const data = yaml.load(fileContents);
    return {
        rows: data.rows.map(((r, iRow) => {
            const row = new LbRow(iRow);
            row.row = r.row.map((vc, iVc) => {
                console.log("Object.keys(vc)", Object.keys(vc));
                const vcName = Object.keys(vc)[0];
                const lbVisualComponent = new LbVisualComponent(iRow, iVc);
                lbVisualComponent.visualComponent = vcName;
                const vb = vc[lbVisualComponent.visualComponent];
                lbVisualComponent.ns = vb.ns;
                lbVisualComponent.contentKeys = convertContentKeys(vb, lbVisualComponent.ns);
                lbVisualComponent.theme = vb.theme;
                lbVisualComponent.options = vb.options;
                lbVisualComponent.implementationModule = "nodoku-flowbite";
                lbVisualComponent.implementationComponent = lbVisualComponent.visualComponent;
                return lbVisualComponent;
            });
            return row;
        }))
    };
}
function convertContentKeys(vb, defaultNs) {
    var contentKeys = vb.contentKeys;
    if (!contentKeys && vb.contentKey) {
        contentKeys = [vb.contentKey];
    }
    if (!contentKeys || !contentKeys.length) {
        return [];
    }
    return contentKeys.map((ck) => {
        if (typeof ck == "string") {
            return new LbContentKey(ck, defaultNs);
        }
        else {
            return new LbContentKey(ck.key, ck.ns ? ck.ns : defaultNs);
        }
    });
}
async function RenderingPage(props) {
    const { pageName, lng, i18nextProvider, contentYamlProvider, visualYamlProvider } = props;
    var { componentProvider } = props;
    if (!componentProvider) {
        componentProvider = defaultComponentProvider;
    }
    const pageVisual = await fetchPageVisual(pageName, visualYamlProvider);
    const namespaces = new Set();
    pageVisual.rows.forEach((r) => {
        r.row.forEach((vc) => {
            vc.contentKeys.forEach((ck) => {
                console.log(ck.ns);
                namespaces.add(ck.ns);
            });
        });
    });
    const pageContent = await fetchPageContent(lng, Array.from(namespaces.keys()), contentYamlProvider);
    const l = await Promise.all(pageVisual.rows.map(async (row, iRow) => {
        return await createSubRows(row, iRow, pageContent, lng, i18nextProvider, componentProvider);
    }));
    const rows = l.flatMap((a) => a);
    return <>{rows}</>;
}
async function createSubRows(row, iRow, pageContent, lng, i18nProvider, componentProvider) {
    const rowComponents = await Promise.all(row.row.map(async (visualSection, iComp) => {
        return await createRowBlock(iRow, iComp, visualSection, pageContent, lng, i18nProvider, componentProvider);
    }));
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
async function createRowBlock(rowIndex, componentIndex, visualSection, pageContent, lng, i18nProvider, componentProvider) {
    const blocks = visualSection.contentKeys
        .map((k) => pageContent.get(k.ns)?.blocks.find((b) => b.key == k.key))
        .filter((b) => b != undefined)
        .map((b) => b);
    console.log("retrieving comp", rowIndex, componentIndex);
    const component = await componentProvider(visualSection.implementationComponent);
    console.log("after component");
    return renderWithVisual(rowIndex, componentIndex, component, blocks, visualSection, lng, i18nProvider);
}
async function renderWithVisual(rowIndex, componentIndex, component, section, visualSection, lng, i18nextProvider) {
    console.log("start rendering page");
    const props = {
        rowIndex: rowIndex,
        componentIndex: componentIndex,
        content: section,
        visual: visualSection.theme,
        options: visualSection.options,
        lng: lng,
        i18nextProvider: i18nextProvider
    };
    return await component(props);
}
export { RenderingPage };
