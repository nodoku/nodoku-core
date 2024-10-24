import HTMLElement from "node-html-parser/dist/nodes/html";
export declare class NdContentImage {
    url: NdTranslatedText;
    title?: NdTranslatedText;
    alt?: NdTranslatedText;
}
export declare class NdTranslatedText {
    key: string;
    ns: string;
    text: string;
    excludeFromTranslation: boolean;
    constructor(ns: string, key?: string, text?: string, excludeFromTranslation?: boolean);
}
export declare class NdList {
    items: NdTranslatedText[];
    ordered: boolean;
    private constructor();
    static createOrdered(items: NdTranslatedText[]): NdList;
    static createUnOrdered(items: NdTranslatedText[]): NdList;
}
export declare class NdCode {
    lang: string;
    code: string;
    constructor(lang: string, code: string);
}
export declare class NdContentBlock {
    id: string;
    lng: string;
    attributes: {
        key: string;
        value: string;
    }[];
    tags: string[];
    namespace: string;
    title?: NdTranslatedText;
    subTitle?: NdTranslatedText;
    h3?: NdTranslatedText;
    h4?: NdTranslatedText;
    h5?: NdTranslatedText;
    h6?: NdTranslatedText;
    footer?: NdTranslatedText;
    paragraphs: (NdTranslatedText | NdList | NdCode)[];
    bgImageUrl?: NdTranslatedText;
    images: NdContentImage[];
    htmlElements: {
        htmlElem: HTMLElement;
        translatedText: (NdTranslatedText | NdContentImage | NdList | NdCode);
    }[];
    constructor(id: string, ns: string, lng: string);
    getByKey(key: string, ns: string): string | undefined;
}
