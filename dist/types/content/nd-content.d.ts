export declare class NdContentImage {
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
export declare class NdContentBlock {
    id: string;
    lng: string;
    attributes: {
        key: string;
        value: string;
    }[];
    tags: string[];
    namespace: string | undefined;
    title?: LbTranslatedText;
    subTitle?: LbTranslatedText;
    h3?: LbTranslatedText;
    h4?: LbTranslatedText;
    h5?: LbTranslatedText;
    h6?: LbTranslatedText;
    footer?: LbTranslatedText;
    paragraphs: LbTranslatedText[];
    bgImage?: NdContentImage;
    images: NdContentImage[];
    constructor(id: string, lng: string);
    getByKey(key: string): string | undefined;
}
export declare class NdContent {
    blocks: NdContentBlock[];
}
