import HTMLElement from "node-html-parser/dist/nodes/html";
export declare class NdContentImage {
    url: NdTranslatableText;
    title?: NdTranslatableText;
    alt?: NdTranslatableText;
}
export declare class NdTranslatableText {
    key: string;
    ns: string;
    text: string;
    excludeFromTranslation: boolean;
    constructor(ns: string, key?: string, text?: string, excludeFromTranslation?: boolean);
}
export declare class NdList {
    items: NdTranslatableText[];
    ordered: boolean;
    private constructor();
    static createOrdered(items: NdTranslatableText[]): NdList;
    static createUnOrdered(items: NdTranslatableText[]): NdList;
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
    title?: NdTranslatableText;
    subTitle?: NdTranslatableText;
    h3?: NdTranslatableText;
    h4?: NdTranslatableText;
    h5?: NdTranslatableText;
    h6?: NdTranslatableText;
    footer?: NdTranslatableText;
    paragraphs: (NdTranslatableText | NdList | NdCode)[];
    images: NdContentImage[];
    htmlElements: {
        htmlElem: HTMLElement;
        translatedText: (NdTranslatableText | NdContentImage | NdList | NdCode);
    }[];
    constructor(id: string, ns: string, lng: string);
    getByKey(key: string, ns: string): string | undefined;
}
