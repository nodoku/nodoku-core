import {I18nextProvider} from "../core/providers";
import {NdContentBlock} from "../content/nd-content";

export class NdContentKey {
    key: string;
    ns: string;

    constructor(key: string, ns: string) {
        this.key = key;
        this.ns = ns;
    }
}

export class NdSkinComponent {
    rowIndex: number;
    componentIndex: number;
    // visualComponent: string = ""
    // ns: string = ""
    // contentKeys: NdContentKey[] = [];
    theme: any;
    options: any;
    // implementationModule: string = "";
    componentName: string = "";
    selector: NdContentSelector;

    constructor(rowIndex: number, componentIndex: number, selector: NdContentSelector) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.selector = selector;
    }
}

export class NdRow {
    rowIndex: number;
    row: NdSkinComponent[] = [];

    constructor(rowIndex: number) {
        this.rowIndex = rowIndex;
    }
}


export class NdPageSkin {
    rows: NdRow[] = []
}

export class NdContentSelector {
    attributes: {key: string, value: string}[] = [];
    tags: string[] = []
    namespace: string | undefined = undefined;

    constructor(attributes: {key: string, value: string}[], tags: string[] = [], namespace: string | undefined = undefined) {
        this.attributes = attributes ? attributes : [];
        this.tags = tags ? tags : [];
        this.namespace = namespace;
    }

    match(block: NdContentBlock): boolean {

        console.log("NdContentSelector attributes === ", this.attributes, this.tags, this.namespace);
        console.log("NdContentSelector block attributes === ", block.attributes, block.tags);

        const attrMatch =
            this.attributes.filter(a1 =>
                block.attributes && block.attributes.filter(a2 =>
                    a1.key == a2.key && a1.value == a2.value).length > 0).length;

        const tagsMatch = this.tags.filter(t1 =>
            block.tags && block.tags.filter(t2 => t1 == t2).length > 0).length;

        const nsMatch = this.namespace ? this.namespace == block.namespace : true;

        return attrMatch == this.attributes.length && tagsMatch == this.tags.length && nsMatch;
    }

    filterBlocks(blocks: NdContentBlock[]): NdContentBlock[] {
        return blocks.filter(b => this.match(b))
    }

}

export class NdComponentDefinition {
    numBlocks: number | string;

    constructor(numBlocks: number | string) {
        this.numBlocks = numBlocks;
    }

}

export class NdSkinComponentProps<TComponentTheme = any, TComponentOptions = any> {
    rowIndex: number;
    componentIndex: number;
    content: NdContentBlock[];
    theme: TComponentTheme | undefined;
    options: TComponentOptions | undefined;
    lng: string;
    i18nextProvider: I18nextProvider;

    constructor(rowIndex: number, componentIndex: number, content: NdContentBlock[], theme: TComponentTheme, options: TComponentOptions, lng: string, i18nextProvider: I18nextProvider) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.content = content;
        this.theme = theme;
        this.options = options;
        this.lng = lng;
        this.i18nextProvider = i18nextProvider;
    }
}

