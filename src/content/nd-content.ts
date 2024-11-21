import HTMLElement from "node-html-parser/dist/nodes/html";

export class NdContentImage {
    url: NdTranslatableText = {} as NdTranslatableText;
    title?: NdTranslatableText;
    alt?: NdTranslatableText;


}

export class NdTranslatableText {
    key: string = "";
    ns: string = "";
    text: string = "";
    excludeFromTranslation: boolean = false;

    constructor(ns: string, key: string = "", text: string = "", excludeFromTranslation = false) {
        this.ns = ns;
        this.key = key;
        this.text = text;
        this.excludeFromTranslation = excludeFromTranslation;
    }
}

export class NdList {
    items: NdTranslatableText[];
    ordered: boolean;

    private constructor(ordered: boolean, items: NdTranslatableText[]) {
        this.ordered = ordered;
        this.items = items;
    }

    public static createOrdered(items: NdTranslatableText[]): NdList {
        return new NdList(true, items)
    }

    public static createUnOrdered(items: NdTranslatableText[]): NdList {
        return new NdList(false, items)
    }

}

export class NdCode {
    lang: string;
    code: string;

    constructor(lang: string, code: string) {
        this.lang = lang;
        this.code = code;
    }

}

export class NdContentBlock {
    id: string;
    lng: string;
    attributes: {key: string, value: string}[] = [];
    tags: string[] = []
    namespace: string;
    title?: NdTranslatableText;
    subTitle?: NdTranslatableText;
    h3?: NdTranslatableText;
    h4?: NdTranslatableText;
    h5?: NdTranslatableText;
    h6?: NdTranslatableText;
    footer?: NdTranslatableText;
    paragraphs: (NdTranslatableText | NdList | NdCode)[] = [];
    // bgImageUrl?: NdTranslatableText;
    images: NdContentImage[] = [];
    htmlElements: {htmlElem: HTMLElement, translatedText: (NdTranslatableText | NdContentImage | NdList | NdCode)}[] = [];

    constructor(id: string, ns: string, lng: string) {
        this.id = id;
        this.namespace = ns;
        this.lng = lng;
        this.attributes.push({key: "id", value: id})
    }

    getByKey(key: string, ns: string): string | undefined {

        if (!key.startsWith(this.id) || ns !== this.namespace) {
            return undefined;
        }

        const path = key.substring(this.id.length + 1)

        // console.log("getByKey ", key, path)

        const val: any = getPropertyFromObjectRecursively(this, path);
        if (typeof val == "string") {
            return val;
        }
        return val ? val.toString() : val;

    }
}

function getPropertyFromObjectRecursively(obj: any, path: string): any {

    // console.log(`getting path from obj >>${path}<<`, obj)

    if (obj instanceof NdTranslatableText) {
        return obj.text
    }

    if (path.length == 0) {
        return obj;
    }

    let p: string = path;
    let nextP: string = "";
    const k = path.indexOf(".");
    if (k > -1) {
        p = path.substring(0, k);
        nextP = path.substring(k + 1)
    }

    if (obj[p]) {
        return getPropertyFromObjectRecursively(obj[p], nextP);
    }

    return undefined;

}


