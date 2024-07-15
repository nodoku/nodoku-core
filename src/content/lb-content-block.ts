import {i18nextProvider} from "./providers";

export class LbContentImage {
    url?: LbTranslatedText;
    title?: LbTranslatedText;
    alt?: LbTranslatedText;
}

export class LbTranslatedText {
    key: string = "";
    ns: string = "";
    text: string = "";

    constructor(ns: string, key: string = "", text: string = "") {
        this.ns = ns;
        this.key = key;
        this.text = text;
    }
}

export class LbContentBlock {
    key: string;
    title?: LbTranslatedText;
    subTitle?: LbTranslatedText;
    footer?: LbTranslatedText;
    paragraphs: LbTranslatedText[] = [];
    bgImage?: LbContentImage;
    images: LbContentImage[] = []

    constructor(key: string) {
        this.key = key;
    }
}

export class LbNsContent {
    blocks: LbContentBlock[] = [];
}

export class LbContentKey {
    key: string;
    ns: string;

    constructor(key: string, ns: string) {
        this.key = key;
        this.ns = ns;
    }
}

export class LbVisualComponent {
    rowIndex: number;
    componentIndex: number;
    visualComponent: string = ""
    ns: string = ""
    contentKeys: LbContentKey[] = [];
    theme: any;
    options: any;
    implementationModule: string = "";
    implementationComponent: string = "";

    constructor(rowIndex: number, componentIndex: number) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
    }
}

export class LbRow {
    rowIndex: number;
    row: LbVisualComponent[] = [];

    constructor(rowIndex: number) {
        this.rowIndex = rowIndex;
    }
}

export class LbPageVisual {
    rows: LbRow[] = []
}

export class LbComponentProps<TComponentTheme = any, TComponentOptions = any> {
    rowIndex: number;
    componentIndex: number;
    content: LbContentBlock[];
    visual: TComponentTheme;
    options: TComponentOptions;
    lng: string;
    i18nextProvider: i18nextProvider;

    constructor(rowIndex: number, componentIndex: number, content: LbContentBlock[], visual: TComponentTheme, options: TComponentOptions, lng: string, i18nextProvider: i18nextProvider) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.content = content;
        this.visual = visual;
        this.options = options;
        this.lng = lng;
        this.i18nextProvider = i18nextProvider;
    }
}

