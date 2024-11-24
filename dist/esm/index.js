import { NdContentImage, NdTranslatableText, NdList, NdCode, NdContentBlock } from "./content/nd-content";
import { NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy } from "./skin/nd-skin";
import { RenderingPageProps, RenderingPriority } from "./core/rendering-page-props";
import { RenderingPage } from "./core/rendering-page";
import { mergeTheme } from "./theme-utils/theme-merger";
import { defaultRowThemeImpl } from "./theme-utils/row-style";
export { NdContentImage, NdTranslatableText, NdList, NdCode, NdContentBlock, NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy };
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
export const defaultRowTheme = defaultRowThemeImpl;
