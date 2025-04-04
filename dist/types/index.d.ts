import { NdContentImage, NdTranslatableText, NdList, /*NdLink, */ NdListItem, NdCode, NdCallToAction, NdParagraph, NdContentBlock } from "./content/nd-content";
import { NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy, NdDefaultThemeName } from "./skin/nd-skin";
import { RenderingPageProps, RenderingPriority } from "./core/rendering-page-props";
import { RenderingPage } from "./core/rendering-page";
import { NdI18nextProvider, AsyncFunctionComponent, NdImageProvider, NdImageProps, NdI18nextTrustedHtmlProvider, NdHtmlSanitizer, NdTrustedHtml, NdI18NextPostProcessor } from "./core/providers";
import { mergeTheme } from "./theme-utils/theme-merger";
import { ThemeStyle } from "./theme-utils/theme-style";
import { ExtendedThemeStyle } from "./theme-utils/extended-theme-style";
import { ImageStyle } from "./theme-utils/image-style";
import { RowStyle } from "./theme-utils/row-style";
export { NdContentImage, NdTranslatableText, NdList, type NdListItem, NdCode, NdCallToAction, NdContentBlock, NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy, type NdParagraph, type NdDefaultThemeName, type NdImageProps, type NdI18nextTrustedHtmlProvider, type NdHtmlSanitizer, type NdTrustedHtml, type NdI18NextPostProcessor };
export { RenderingPageProps, RenderingPriority, RenderingPage };
export { mergeTheme, type ThemeStyle, type ExtendedThemeStyle, type ImageStyle };
export type { NdI18nextProvider, AsyncFunctionComponent, NdImageProvider };
export { DummyComp } from "./core/dummy-comp";
export { contentMarkdownProvider, parseMarkdownAsContent } from "./providers/content/content-markdown-provider";
export { skinYamlProvider, parseYamlContentAsSkin } from "./providers/skin/skin-yaml-provider";
export declare const ts: <T>(t: T, key: keyof T) => string;
export declare const tsi: <T>(t: T, key: keyof T, i: number) => string;
export declare const extractValueFromText: (text: NdTrustedHtml | undefined, attrName: string) => NdTrustedHtml | undefined;
export declare const defaultRowTheme: RowStyle;
