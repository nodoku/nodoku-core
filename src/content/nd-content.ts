
export class NdContentImage {
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

export class NdContentBlock {
    id: string;
    attributes: {key: string, value: string}[] = [];
    tags: string[] = []
    namespace: string | undefined = undefined;
    title?: LbTranslatedText;
    subTitle?: LbTranslatedText;
    h3?: LbTranslatedText;
    h4?: LbTranslatedText;
    h5?: LbTranslatedText;
    h6?: LbTranslatedText;
    footer?: LbTranslatedText;
    paragraphs: LbTranslatedText[] = [];
    bgImage?: NdContentImage;
    images: NdContentImage[] = []

    constructor(id: string) {
        this.id = id;
    }
}

export class NdContent {
    blocks: NdContentBlock[] = [];

}

