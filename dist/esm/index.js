import { NdContentImage, NdTranslatableText, NdList, NdCode, NdCallToAction, NdContentBlock } from "./content/nd-content";
import { NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy } from "./skin/nd-skin";
import { RenderingPageProps, RenderingPriority } from "./core/rendering-page-props";
import { RenderingPage } from "./core/rendering-page";
import { mergeTheme } from "./theme-utils/theme-merger";
import { defaultRowThemeImpl } from "./theme-utils/row-style";
export { NdContentImage, NdTranslatableText, NdList, NdCode, NdCallToAction, NdContentBlock, NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy };
export { RenderingPageProps, RenderingPriority, RenderingPage };
export { mergeTheme };
export { DummyComp } from "./core/dummy-comp";
export { contentMarkdownProvider, parseMarkdownAsContent } from "./providers/content/content-markdown-provider";
export { skinYamlProvider, parseYamlContentAsSkin } from "./providers/skin/skin-yaml-provider";
export const ts = function (t, key) {
    const themeStyle = t[key];
    const k = key;
    return k + " " + themeStyle?.base + " " + themeStyle?.decoration;
};
export const tsi = function (t, key, i) {
    // console.log("in tsi ", key, t[key], Array.isArray(t[key]), [1, 2, 3], Array.isArray([1, 2, 3]))
    if (typeof t[key] === 'object') {
        // console.log("this is tsi object", key)
        const len = Object.keys(t[key]).length;
        const obj = t[key];
        const themeStyle = obj[i % len];
        const k = key;
        return k + `[${i}]` + themeStyle?.base + " " + themeStyle?.decoration;
    }
    else if (Array.isArray(t[key])) {
        // console.log("this is tsi array", key)
        const len = t[key].length;
        const themeStyle = t[key][i % len];
        const k = key;
        return k + `[${i}]` + themeStyle?.base + " " + themeStyle?.decoration;
    }
    else {
        return ts(t, key);
    }
};
export const extractValueFromText = (text, attrName) => {
    if (text && text.__html.startsWith(`{${attrName}}`)) {
        return { __html: text.__html.substring(`{${attrName}}`.length) };
    }
    return text;
};
export const defaultRowTheme = defaultRowThemeImpl;
