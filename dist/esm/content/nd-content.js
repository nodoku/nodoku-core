export class NdContentImage {
    url;
    title;
    alt;
}
export class LbTranslatedText {
    key = "";
    ns = "";
    text = "";
    constructor(ns, key = "", text = "") {
        this.ns = ns;
        this.key = key;
        this.text = text;
    }
}
export class NdContentBlock {
    id;
    attributes = [];
    tags = [];
    namespace = undefined;
    title;
    subTitle;
    h3;
    h4;
    h5;
    h6;
    footer;
    paragraphs = [];
    bgImage;
    images = [];
    constructor(id) {
        this.id = id;
    }
}
export class NdContent {
    blocks = [];
}
