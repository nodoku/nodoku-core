
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
    lng: string;
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

    constructor(id: string, lng: string) {
        this.id = id;
        this.lng = lng;
    }

    getByKey(key: string): string | undefined {

        if (!key.startsWith(this.id)) {
            return undefined;
        }

        const path = key.substring(this.id.length + 1)

        console.log("getByKey ", key, path)

        const val: any = getPropertyFromObjectRecursively(this, path);
        if (typeof val == "string") {
            return val;
        }
        return val ? val.toString() : val;

    }
}

function getPropertyFromObjectRecursively(obj: any, path: string): any {

    console.log("getting path from obj", obj, path)

    if (obj instanceof LbTranslatedText) {
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

export class NdContent {
    blocks: NdContentBlock[] = [];

}

