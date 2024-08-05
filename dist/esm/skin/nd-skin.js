export class NdContentKey {
    key;
    ns;
    constructor(key, ns) {
        this.key = key;
        this.ns = ns;
    }
}
export class NdSkinComponent {
    rowIndex;
    componentIndex;
    // visualComponent: string = ""
    // ns: string = ""
    // contentKeys: NdContentKey[] = [];
    theme;
    options;
    // implementationModule: string = "";
    componentName = "";
    selector;
    constructor(rowIndex, componentIndex, selector) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.selector = selector;
    }
}
export class NdRow {
    rowIndex;
    row = [];
    constructor(rowIndex) {
        this.rowIndex = rowIndex;
    }
}
export class NdPageSkin {
    rows = [];
}
export class NdContentSelector {
    attributes = [];
    tags = [];
    namespace = undefined;
    constructor(attributes, tags = [], namespace = undefined) {
        this.attributes = attributes ? attributes : [];
        this.tags = tags ? tags : [];
        this.namespace = namespace;
    }
    match(block) {
        console.log("NdContentSelector attributes === ", this.attributes, this.tags, this.namespace);
        console.log("NdContentSelector block attributes === ", block.attributes, block.tags);
        const attrMatch = this.attributes.filter(a1 => block.attributes && block.attributes.filter(a2 => a1.key == a2.key && a1.value == a2.value).length > 0).length;
        const tagsMatch = this.tags.filter(t1 => block.tags && block.tags.filter(t2 => t1 == t2).length > 0).length;
        const nsMatch = this.namespace ? this.namespace == block.namespace : true;
        return attrMatch == this.attributes.length && tagsMatch == this.tags.length && nsMatch;
    }
    filterBlocks(blocks) {
        return blocks.filter(b => this.match(b));
    }
}
export class NdComponentDefinition {
    numBlocks;
    constructor(numBlocks) {
        this.numBlocks = numBlocks;
    }
}
export class NdSkinComponentProps {
    rowIndex;
    componentIndex;
    content;
    theme;
    options;
    lng;
    i18nextProvider;
    constructor(rowIndex, componentIndex, content, theme, options, lng, i18nextProvider) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.content = content;
        this.theme = theme;
        this.options = options;
        this.lng = lng;
        this.i18nextProvider = i18nextProvider;
    }
}
