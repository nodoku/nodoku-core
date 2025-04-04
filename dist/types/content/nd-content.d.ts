import HTMLElement from "node-html-parser/dist/nodes/html";
export declare class NdContentImage {
    url: NdTranslatableText;
    title?: NdTranslatableText;
    alt?: NdTranslatableText;
}
export declare class NdCallToAction {
    ctaUrl: NdTranslatableText;
    ctaTitle?: NdTranslatableText;
}
export declare class NdTranslatableText {
    key: string;
    ns: string;
    text: string;
    excludeFromTranslation: boolean;
    constructor(ns: string, key?: string, text?: string, excludeFromTranslation?: boolean);
}
export type NdListItem = {
    text: NdTranslatableText;
    subList: NdParagraph | undefined;
};
export declare class NdList {
    items: NdListItem[];
    ordered: boolean;
    private constructor();
    static createOrdered(items: NdListItem[]): NdList;
    static createUnOrdered(items: NdListItem[]): NdList;
}
export declare class NdCode {
    lang: string;
    code: string;
    constructor(lang: string, code: string);
}
export type NdParagraph = NdTranslatableText | NdList | NdCode;
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
    callToActions: NdCallToAction[];
    paragraphs: NdParagraph[];
    images: NdContentImage[];
    htmlElements: {
        htmlElem: HTMLElement;
        translatedText: (NdTranslatableText | NdContentImage | NdList | NdCode | NdCallToAction);
    }[];
    constructor(id: string, ns: string, lng: string);
    getByKey(key: string, ns: string): string | undefined;
}
