export class NdContentImage {
    url = {};
    title;
    alt;
}
export class NdTranslatableText {
    key = "";
    ns = "";
    text = "";
    excludeFromTranslation = false;
    constructor(ns, key = "", text = "", excludeFromTranslation = false) {
        this.ns = ns;
        this.key = key;
        this.text = text;
        this.excludeFromTranslation = excludeFromTranslation;
    }
}
export class NdList {
    items;
    ordered;
    constructor(ordered, items) {
        this.ordered = ordered;
        this.items = items;
    }
    static createOrdered(items) {
        return new NdList(true, items);
    }
    static createUnOrdered(items) {
        return new NdList(false, items);
    }
}
export class NdCode {
    lang;
    code;
    constructor(lang, code) {
        this.lang = lang;
        this.code = code;
    }
}
export class NdContentBlock {
    id;
    lng;
    attributes = [];
    tags = [];
    namespace;
    title;
    subTitle;
    h3;
    h4;
    h5;
    h6;
    footer;
    paragraphs = [];
    bgImageUrl;
    images = [];
    htmlElements = [];
    constructor(id, ns, lng) {
        this.id = id;
        this.namespace = ns;
        this.lng = lng;
        this.attributes.push({ key: "id", value: id });
    }
    getByKey(key, ns) {
        if (!key.startsWith(this.id) || ns !== this.namespace) {
            return undefined;
        }
        const path = key.substring(this.id.length + 1);
        // console.log("getByKey ", key, path)
        const val = getPropertyFromObjectRecursively(this, path);
        if (typeof val == "string") {
            return val;
        }
        return val ? val.toString() : val;
    }
}
function getPropertyFromObjectRecursively(obj, path) {
    // console.log(`getting path from obj >>${path}<<`, obj)
    if (obj instanceof NdTranslatableText) {
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
