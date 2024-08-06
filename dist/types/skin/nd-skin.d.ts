import { I18nextProvider } from "../core/providers";
import { NdContentBlock } from "../content/nd-content";
export declare class NdContentKey {
    key: string;
    ns: string;
    constructor(key: string, ns: string);
}
export declare class NdSkinComponent {
    rowIndex: number;
    componentIndex: number;
    theme: any;
    options: any;
    componentName: string;
    selector: NdContentSelector;
    constructor(rowIndex: number, componentIndex: number, selector: NdContentSelector);
}
export declare class NdRow {
    rowIndex: number;
    row: NdSkinComponent[];
    constructor(rowIndex: number);
}
export declare class NdPageSkin {
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
    constructor(numBlocks: number | string);
}
export declare class NdSkinComponentProps<TComponentTheme = any, TComponentOptions = any> {
    rowIndex: number;
    componentIndex: number;
    content: NdContentBlock[];
    theme: TComponentTheme | undefined;
    options: TComponentOptions | undefined;
    lng: string;
    i18nextProvider: I18nextProvider;
    constructor(rowIndex: number, componentIndex: number, content: NdContentBlock[], theme: TComponentTheme, options: TComponentOptions, lng: string, i18nextProvider: I18nextProvider);
}
