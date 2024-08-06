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
    lng;
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
    constructor(id, lng) {
        this.id = id;
        this.lng = lng;
    }
    getByKey(key) {
        if (!key.startsWith(this.id)) {
            return undefined;
        }
        const path = key.substring(this.id.length + 1);
        console.log("getByKey ", key, path);
        const val = getPropertyFromObjectRecursively(this, path);
        if (typeof val == "string") {
            return val;
        }
        return val ? val.toString() : val;
    }
}
function getPropertyFromObjectRecursively(obj, path) {
    console.log("getting path from obj", obj, path);
    if (obj instanceof LbTranslatedText) {
        return obj.text;
    }
    if (path.length == 0) {
        return obj;
    }
    let p = path;
    let nextP = "";
    const k = path.indexOf(".");
    if (k > -1) {
        p = path.substring(0, k);
        nextP = path.substring(k + 1);
    }
    if (obj[p]) {
        return getPropertyFromObjectRecursively(obj[p], nextP);
    }
    return undefined;
}
export class NdContent {
    blocks = [];
}
