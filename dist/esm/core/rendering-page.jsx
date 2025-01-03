import React from "react";
import { NdComponentDefinition, NdContentSelector, NdPageSkin, NdRow, NdSkinComponent } from "../skin/nd-skin";
import { RenderingPriority } from "./rendering-page-props";
import { DummyComp } from "./dummy-comp";
import yaml from "js-yaml";
import fs from "node:fs";
import { mergeTheme } from "../theme-utils/theme-merger";
import { defaultRowThemeImpl } from "../theme-utils/row-style";
import { ts } from "../index";
async function defaultComponentResolver() {
    const compoDef = new NdComponentDefinition("unlimited", undefined, {});
    return { compo: DummyComp, compoDef: compoDef };
}
async function defaultImageProvider(imageProps) {
    const { imageStyle, url, alt } = imageProps;
    return <img className={`${imageStyle?.base} ${imageStyle?.decoration}`} src={url} alt={alt}/>;
}
async function RenderingPage(props) {
    const { lng, renderingPriority, content, componentResolver, skin, imageProvider, i18nextProvider, i18nextPostProcessor, htmlSanitizer, clientSideComponentProvider } = props;
    const actualComponentResolver = componentResolver ? componentResolver : defaultComponentResolver;
    let l;
    if (skin) {
        let blockSkin = skin;
        if (renderingPriority == RenderingPriority.content_first) {
            blockSkin = generateSkinByContentBlocks(content, skin);
        }
        // console.log(" >>> this is my content <<< ", content)
        // console.log(" >>> this is my skin <<< ", JSON.stringify(blockSkin))
        l = await Promise.all(blockSkin.rows.map(async (row, iRow) => await createRow(row, iRow, content, lng, imageProvider, i18nextProvider, i18nextPostProcessor, actualComponentResolver, htmlSanitizer, clientSideComponentProvider)));
    }
    else {
        l = [await createRow(undefined, 0, content, lng, imageProvider, i18nextProvider, i18nextPostProcessor, actualComponentResolver, htmlSanitizer, clientSideComponentProvider)];
    }
    const actualSkin = mergeTheme(skin, { renderingPage: { base: "", decoration: "" }, rows: [] });
    return <div className={`rows-container ${ts(actualSkin, "renderingPage")}`}>{l}</div>;
}
function generateSkinByContentBlocks(blocks, skin) {
    const rendered = new Set();
    let currentRow = undefined;
    const res = new NdPageSkin();
    let rowIndex = 0;
    blocks.map((b) => {
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
async function createRow(row, iRow, blocks, lng, imageProvider, i18nProvider, i18nextPostProcessor, componentResolver, htmlSanitizer, clientSideComponentProvider) {
    let l;
    if (row) {
        l = await Promise.all(row.components.map(async (visualSection, iComp) => await createRowComponents(iRow, iComp, visualSection, blocks, lng, imageProvider, i18nProvider, i18nextPostProcessor, componentResolver, htmlSanitizer, clientSideComponentProvider)));
    }
    else {
        l = await Promise.all(blocks.map(async (block, iComp) => await createRowComponents(iRow, iComp, undefined, [block], lng, imageProvider, i18nProvider, i18nextPostProcessor, componentResolver, htmlSanitizer, clientSideComponentProvider)));
    }
    const rowComponents = l.flatMap((p) => p);
    if (rowComponents.length == 0) {
        return <div key={`row-${iRow}`}></div>;
    }
    const numComponents = rowComponents.length;
    const rowEffectiveTheme = mergeTheme(row?.theme, defaultRowThemeImpl);
    const maxCols = row?.maxCols ? row.maxCols : 3;
    const numCols = numComponents <= maxCols ? numComponents : maxCols;
    let gridCols = "grid-cols-1";
    let flexBasis = "basis-full";
    switch (numCols) {
        case 1:
            gridCols = "lg:grid-cols-1";
            flexBasis = "lg:basis-full";
            break;
        case 2:
            gridCols = "lg:grid-cols-2";
            flexBasis = "lg:basis-1/2";
            break;
        case 3:
            gridCols = "lg:grid-cols-3";
            flexBasis = "lg:basis-1/3";
            break;
        case 4:
            gridCols = "lg:grid-cols-4";
            flexBasis = "lg:basis-1/4";
            break;
        case 5:
            gridCols = "lg:grid-cols-5";
            flexBasis = "lg:basis-1/5";
            break;
        case 6:
            gridCols = "lg:grid-cols-6";
            flexBasis = "lg:basis-1/6";
            break;
        case 7:
            gridCols = "lg:grid-cols-7";
            flexBasis = "lg:basis-1/7";
            break;
        case 8:
            gridCols = "lg:grid-cols-8";
            flexBasis = "lg:basis-1/8";
            break;
        case 9:
            gridCols = "lg:grid-cols-9";
            flexBasis = "lg:basis-1/9";
            break;
        case 10:
            gridCols = "lg:grid-cols-10";
            flexBasis = "lg:basis-1/10";
            break;
        case 11:
            gridCols = "lg:grid-cols-11";
            flexBasis = "lg:basis-1/11";
            break;
        case 12:
            gridCols = "lg:grid-cols-12";
            flexBasis = "lg:basis-1/12";
            break;
    }
    let rowDisplay = `grid ${gridCols}`;
    if (rowEffectiveTheme.rowDisplay == "flex") {
        rowDisplay = "flex flex-row justify-center flex-wrap flex-1";
    }
    return (<div key={`row-${iRow}`} className={`row-${iRow} ${rowDisplay} ${rowEffectiveTheme?.base} ${rowEffectiveTheme?.decoration} class-row-${iRow}`}>
            {rowComponents.map((c, i) => <div key={`row-${iRow}-component-${i}`} className={`row-${iRow}-component-${i} nd-component-holder ${flexBasis} ${ts(rowEffectiveTheme, "componentHolder")}`}>
                        {c}
                    </div>)}
        </div>);
}
async function createRowComponents(rowIndex, blockIndex, skinComponent, pageContent, lng, imageProvider, i18nProvider, i18nextPostProcessor, componentResolver, htmlSanitizer, clientSideComponentProvider) {
    // console.log("before component", skinComponent)
    const filteredBlocks = skinComponent ? skinComponent.selector.filterBlocks(pageContent) : pageContent;
    if (filteredBlocks.length == 0) {
        return [];
    }
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
            res.push(await renderSingleComponent(rowIndex, compIndex, compo, blocks, skinComponent?.defaultThemeName || "light", compoDef.defaultTheme, skinComponent?.themeHierarchy, lng, imageProvider, i18nProvider, i18nextPostProcessor, htmlSanitizer, clientSideComponentProvider));
        }
        start = end;
        ++i;
    } while (end < filteredBlocks.length);
    return res;
}
function wrapInPostProcessor(provider, postProcessor) {
    // if (postProcessor) {
    //
    //     return async (lng: string): Promise<{t: (text: NdTranslatableText) => NdTrustedHtml}> => {
    //
    //         const {t} = await provider(lng)
    //         const tt = (txt: NdTranslatableText): NdTrustedHtml => {
    //             // const translated: NdTrustedHtml = t(txt);
    //             // let res = translated;
    //             // if (typeof translated === "string") {
    //             //     res = postProcessor(translated)
    //             // }
    //             // return res;
    //             return postProcessor(t(txt))
    //         }
    //
    //         return {t: tt}
    //     }
    // } else {
    //     return provider;
    // }
    return async (lng) => {
        const { t } = await provider(lng);
        const tt = (txt) => {
            // const translated: NdTrustedHtml = t(txt);
            // let res = translated;
            // if (typeof translated === "string") {
            //     res = postProcessor(translated)
            // }
            // return res;
            return postProcessor ? postProcessor(t(txt)) : t(txt);
        };
        return { t: tt };
    };
}
function makeTrusted(provider, sanitizer) {
    return async (lng) => {
        const { t } = await provider(lng);
        const tt = (txt) => {
            // const translated: NdTrustedHtml = t(txt);
            // let res = translated;
            // if (typeof translated === "string") {
            //     res = postProcessor(translated)
            // }
            // return res;
            return sanitizer(t(txt));
        };
        return { t: tt };
    };
}
async function renderSingleComponent(rowIndex, componentIndex, component, blocks, defaultThemeName, defaultTheme, themeHierarchy, lng, imageProvider, i18nextProvider, i18nextPostProcessor, htmlSanitizer, clientSideComponentProvider) {
    let actualI18nextProvider_;
    if (lng == blocks[0].lng || !i18nextProvider) {
        actualI18nextProvider_ = async (lng) => {
            return { t: (text) => {
                    const b = blocks.map((b) => b.getByKey(text.key, text.ns)).find((s) => s);
                    return b ? b : `key not found: ${text.ns}:${text.key}`;
                } };
        };
    }
    else {
        actualI18nextProvider_ = i18nextProvider;
    }
    const actualI18nextProvider = makeTrusted(wrapInPostProcessor(actualI18nextProvider_, i18nextPostProcessor), htmlSanitizer || ((text) => ({ __html: text })));
    const actualImageProvider = imageProvider ? imageProvider : defaultImageProvider;
    const actualClientSideComponentProvider = clientSideComponentProvider ? clientSideComponentProvider : (c) => <span>[placeholder for: {c}]</span>;
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
        imageProvider: actualImageProvider,
        i18nextTrustedHtmlProvider: actualI18nextProvider,
        clientSideComponentProvider: actualClientSideComponentProvider
    };
    // console.log("start rendering page with props", props);
    const res = await component(props);
    // console.log("end rendering page with props", props);
    return res;
}
export { RenderingPage };
