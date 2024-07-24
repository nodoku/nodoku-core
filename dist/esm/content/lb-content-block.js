export class LbContentImage {
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
export class LbContentBlock {
    key;
    title;
    subTitle;
    footer;
    paragraphs = [];
    bgImage;
    images = [];
    constructor(key) {
        this.key = key;
    }
}
export class LbNsContent {
    blocks = [];
}
export class LbContentKey {
    key;
    ns;
    constructor(key, ns) {
        this.key = key;
        this.ns = ns;
    }
}
export class LbVisualComponent {
    rowIndex;
    componentIndex;
    visualComponent = "";
    ns = "";
    contentKeys = [];
    theme;
    options;
    implementationModule = "";
    implementationComponent = "";
    constructor(rowIndex, componentIndex) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
    }
}
export class LbRow {
    rowIndex;
    row = [];
    constructor(rowIndex) {
        this.rowIndex = rowIndex;
    }
}
export class LbPageVisual {
    rows = [];
}
export class LbComponentProps {
    rowIndex;
    componentIndex;
    content;
    visual;
    options;
    lng;
    i18nextProvider;
    constructor(rowIndex, componentIndex, content, visual, options, lng, i18nextProvider) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.content = content;
        this.visual = visual;
        this.options = options;
        this.lng = lng;
        this.i18nextProvider = i18nextProvider;
    }
}
