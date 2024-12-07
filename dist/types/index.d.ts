import { NdContentImage, NdTranslatableText, NdList, NdCode, NdCallToAction, NdContentBlock } from "./content/nd-content";
import { NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy, NdDefaultThemeName } from "./skin/nd-skin";
import { RenderingPageProps, RenderingPriority } from "./core/rendering-page-props";
import { RenderingPage } from "./core/rendering-page";
import { I18nextProvider, AsyncFunctionComponent, ImageProvider, NdImageProps } from "./core/providers";
import { mergeTheme } from "./theme-utils/theme-merger";
import { ThemeStyle } from "./theme-utils/theme-style";
import { ExtendedThemeStyle } from "./theme-utils/extended-theme-style";
import { ImageStyle } from "./theme-utils/image-style";
import { RowStyle } from "./theme-utils/row-style";
export { NdContentImage, NdTranslatableText, NdList, NdCode, NdCallToAction, NdContentBlock, NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy, type NdDefaultThemeName, type NdImageProps };
export { RenderingPageProps, RenderingPriority, RenderingPage };
export { mergeTheme, type ThemeStyle, type ExtendedThemeStyle, type ImageStyle };
export type { I18nextProvider, AsyncFunctionComponent, ImageProvider };
export { DummyComp } from "./core/dummy-comp";
export { contentMarkdownProvider, parseMarkdownAsContent } from "./providers/content/content-markdown-provider";
export { skinYamlProvider, parseYamlContentAsSkin } from "./providers/skin/skin-yaml-provider";
export declare const ts: <T>(t: T, key: keyof T) => string;
export declare const defaultRowTheme: RowStyle;
