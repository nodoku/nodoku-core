import {NdContentImage, NdTranslatedText, NdList, NdCode, NdContentBlock} from "./content/nd-content";
import {NdSkinComponent, NdRow, NdPageSkin, NdSkinComponentProps, NdContentSelector, NdComponentDefinition, NdThemeHierarchy, NdDefaultThemeName} from "./skin/nd-skin";
import {RenderingPageProps, RenderingPriority} from "./core/rendering-page-props";
import {RenderingPage} from "./core/rendering-page"
import {I18nextProvider, AsyncFunctionComponent, ImageUrlProvider} from "./core/providers"
import {mergeTheme} from "./theme-utils/theme-merger";
import {ThemeStyle} from "./theme-utils/theme-style"
import {ExtendedThemeStyle} from "./theme-utils/extended-theme-style"

export {
    NdContentImage,
    NdTranslatedText,
    NdList,
    NdCode,
    NdContentBlock,
    NdSkinComponent,
    NdRow,
    NdPageSkin,
    NdSkinComponentProps,
    NdContentSelector,
    NdComponentDefinition,
    NdThemeHierarchy,
    type NdDefaultThemeName
};

export {RenderingPageProps, RenderingPriority, RenderingPage}

export {mergeTheme, ThemeStyle, ExtendedThemeStyle}

export type {I18nextProvider, AsyncFunctionComponent, ImageUrlProvider};

export {DummyComp} from "./core/dummy-comp"

export {contentMarkdownProvider, parseMarkdownAsContent} from "./providers/content/content-markdown-provider"
export {skinYamlProvider, parseYamlContentAsSkin} from "./providers/skin/skin-yaml-provider"
