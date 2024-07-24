import { i18nextProvider } from "./providers";
export declare class LbContentImage {
    url?: LbTranslatedText;
    title?: LbTranslatedText;
    alt?: LbTranslatedText;
}
export declare class LbTranslatedText {
    key: string;
    ns: string;
    text: string;
    constructor(ns: string, key?: string, text?: string);
}
export declare class LbContentBlock {
    key: string;
    title?: LbTranslatedText;
    subTitle?: LbTranslatedText;
    footer?: LbTranslatedText;
    paragraphs: LbTranslatedText[];
    bgImage?: LbContentImage;
    images: LbContentImage[];
    constructor(key: string);
}
export declare class LbNsContent {
    blocks: LbContentBlock[];
}
export declare class LbContentKey {
    key: string;
    ns: string;
    constructor(key: string, ns: string);
}
export declare class LbVisualComponent {
    rowIndex: number;
    componentIndex: number;
    visualComponent: string;
    ns: string;
    contentKeys: LbContentKey[];
    theme: any;
    options: any;
    implementationModule: string;
    implementationComponent: string;
    constructor(rowIndex: number, componentIndex: number);
}
export declare class LbRow {
    rowIndex: number;
    row: LbVisualComponent[];
    constructor(rowIndex: number);
}
export declare class LbPageVisual {
    rows: LbRow[];
}
export declare class LbComponentProps<TComponentTheme = any, TComponentOptions = any> {
    rowIndex: number;
    componentIndex: number;
    content: LbContentBlock[];
    visual: TComponentTheme;
    options: TComponentOptions;
    lng: string;
    i18nextProvider: i18nextProvider;
    constructor(rowIndex: number, componentIndex: number, content: LbContentBlock[], visual: TComponentTheme, options: TComponentOptions, lng: string, i18nextProvider: i18nextProvider);
}
