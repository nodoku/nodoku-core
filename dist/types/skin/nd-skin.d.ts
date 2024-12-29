import { NdImageProvider } from "../core/providers";
import { NdContentBlock } from "../content/nd-content";
import { ThemeStyle } from "../theme-utils/theme-style";
import { RowStyle } from "../theme-utils/row-style";
import { NdI18nextTrustedHtmlProvider } from "../core/providers";
import { NdClientSideComponentProvider } from "../core/providers";
export type NdDefaultThemeName = "light" | "dark";
export declare class NdThemeHierarchy {
    defaultThemeName: NdDefaultThemeName;
    globalTheme: any | undefined;
    globalThemes: any[] | undefined;
    componentOptions: any | undefined;
    componentTheme: any | undefined;
    componentThemes: any[] | undefined;
    options: any;
    theme: any;
    themes: any[];
    constructor(defaultTheme?: NdDefaultThemeName);
    calculateEffectiveTheme(componentIndex: number, defaultTheme: any): {
        effectiveTheme: any;
        effectiveThemes: any[];
        effectiveOptions: any;
    };
}
export declare class NdSkinComponent {
    rowIndex: number;
    componentIndex: number;
    defaultThemeName: NdDefaultThemeName;
    themeHierarchy?: NdThemeHierarchy;
    componentName: string;
    selector: NdContentSelector;
    constructor(rowIndex: number, componentIndex: number, defaultThemeName: NdDefaultThemeName, selector: NdContentSelector);
}
export declare class NdRow {
    rowIndex: number;
    maxCols?: number;
    theme?: RowStyle;
    components: NdSkinComponent[];
    constructor(rowIndex: number);
}
export declare class NdPageSkin {
    renderingPage: ThemeStyle | undefined;
    rows: NdRow[];
}
export declare class NdContentSelector {
    attributes: {
        key: string;
        value: string;
    }[];
    tags: string[];
    namespace: string | undefined;
    constructor(attributes: {
        key: string;
        value: string;
    }[], tags?: string[], namespace?: string | undefined);
    match(block: NdContentBlock): boolean;
    filterBlocks(blocks: NdContentBlock[]): NdContentBlock[];
}
export declare class NdComponentDefinition {
    numBlocks: number | string;
    defaultTheme: any | undefined;
    defaultThemeYaml: string | undefined;
    constructor(numBlocks: number | string, defaultThemeYaml?: string | undefined, defaultTheme?: any | undefined);
}
export declare class NdSkinComponentProps<TComponentTheme = any, TComponentOptions = any> {
    rowIndex: number;
    componentIndex: number;
    content: NdContentBlock[];
    defaultThemeName: NdDefaultThemeName;
    theme: TComponentTheme | undefined;
    themes: TComponentTheme[];
    options: TComponentOptions | undefined;
    lng: string;
    imageProvider: NdImageProvider;
    i18nextTrustedHtmlProvider: NdI18nextTrustedHtmlProvider;
    clientSideComponentProvider: NdClientSideComponentProvider;
    constructor(rowIndex: number, componentIndex: number, content: NdContentBlock[], defaultThemeName: NdDefaultThemeName, theme: TComponentTheme, themes: TComponentTheme[], options: TComponentOptions, lng: string, imageProvider: NdImageProvider, i18nextTrustedHtmlProvider: NdI18nextTrustedHtmlProvider, clientSideComponentProvider: NdClientSideComponentProvider);
}
