import {NdContentImage, NdTranslatableText, NdList, NdLink, NdListItem, NdCode, NdCallToAction, NdParagraph, NdContentBlock} from "./content/nd-content";
import {NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy, NdDefaultThemeName} from "./skin/nd-skin";
import {RenderingPageProps, RenderingPriority} from "./core/rendering-page-props";
import {RenderingPage} from "./core/rendering-page"
import {NdI18nextProvider, AsyncFunctionComponent, NdImageProvider, NdImageProps, NdI18nextTrustedHtmlProvider, NdHtmlSanitizer, NdTrustedHtml, NdI18NextPostProcessor} from "./core/providers"
import {mergeTheme} from "./theme-utils/theme-merger";
import {ThemeStyle} from "./theme-utils/theme-style"
import {ExtendedThemeStyle} from "./theme-utils/extended-theme-style"
import {ImageStyle} from "./theme-utils/image-style"
import {RowStyle} from "./theme-utils/row-style";
import {defaultRowThemeImpl} from "./theme-utils/row-style";

export {
    NdContentImage,
    NdTranslatableText,
    NdList,
    type NdListItem,
    NdLink,
    NdCode,
    NdCallToAction,
    NdContentBlock,
    NdSkinComponent,
    NdRow,
    NdPageSkin,
    NdSkinComponentProps,
    NdContentSelector,
    NdComponentDefinition,
    NdThemeHierarchy,
    type NdParagraph,
    type NdDefaultThemeName,
    type NdImageProps,
    type NdI18nextTrustedHtmlProvider,
    type NdHtmlSanitizer,
    type NdTrustedHtml,
    type NdI18NextPostProcessor
};

export {RenderingPageProps, RenderingPriority, RenderingPage}

export {mergeTheme, type ThemeStyle, type ExtendedThemeStyle, type ImageStyle}

export type {NdI18nextProvider, AsyncFunctionComponent, NdImageProvider};

export {DummyComp} from "./core/dummy-comp"

export {contentMarkdownProvider, parseMarkdownAsContent} from "./providers/content/content-markdown-provider"
export {skinYamlProvider, parseYamlContentAsSkin} from "./providers/skin/skin-yaml-provider"

export const ts = function <T>(t: T, key: keyof T): string {
    const themeStyle = t[key] as ThemeStyle;
    const k = key as String;
    return k + " " + themeStyle?.base + " " + themeStyle?.decoration;
}

export const tsi = function <T>(t: T, key: keyof T, i: number): string {

    // console.log("in tsi ", key, t[key], Array.isArray(t[key]), [1, 2, 3], Array.isArray([1, 2, 3]))

    if (typeof t[key] === 'object') {
        // console.log("this is tsi object", key)
        const len = Object.keys(t[key] as object).length;
        const obj = t[key] as {[key: number]: any}
        const themeStyle = obj[i % len];
        const k = key as String;
        return k + `[${i}] ` + themeStyle?.base + " " + themeStyle?.decoration;
    } else if (Array.isArray(t[key])) {
        // console.log("this is tsi array", key)
        const len = t[key].length;
        const themeStyle = t[key][i % len] as ThemeStyle;
        const k = key as String;
        return k + `[${i}] ` + themeStyle?.base + " " + themeStyle?.decoration;
    } else {
        return ts(t, key)
    }

}

export const extractValueFromText = (text: NdTrustedHtml | undefined, attrName: string): NdTrustedHtml | undefined => {
    if (text && (text.__html as string).startsWith(`{${attrName}}`)) {

        return {__html: (text.__html as string).substring(`{${attrName}}`.length)}
    }
    return text;
}


export const defaultRowTheme: RowStyle = defaultRowThemeImpl;
