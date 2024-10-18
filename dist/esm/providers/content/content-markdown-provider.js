import { NdTranslatedText, NdList, NdContentBlock, NdContentImage, NdCode } from "nodoku-core";
import { Marked } from '@ts-stack/markdown';
import { parse } from 'node-html-parser';
import yaml from "js-yaml";
const nsRegex = /.*\/(.*)\.md/;
export async function contentMarkdownProvider(mdFileUrl, contentLng, ns = undefined) {
    return await fetch(mdFileUrl)
        .then(response => response.text())
        .then(fileContent => {
        if (!ns) {
            const nsRes = nsRegex.exec(mdFileUrl);
            if (nsRes && nsRes.length > 0) {
                ns = nsRes[0];
            }
        }
        if (!ns) {
            ns = "default";
        }
        return parseMarkdownAsContent(fileContent, contentLng, ns);
    });
}
const footerPattern = /^\|(.*)\|/;
const codePattern = /<code class="lang-(\w+)">(.*)<\/code>/s;
class BlockHolder {
    ns;
    lng;
    blockDefYaml;
    constructor(ns, lng, blockDefYaml = undefined) {
        this.ns = ns;
        this.lng = lng;
        this.blockDefYaml = blockDefYaml;
    }
    blockContent = { paragraphsIndex: [], imagesIndex: [], htmlStream: [] };
    hasContentH1AndBelow() {
        return this.blockContent.titleIndex != undefined || this.hasContentH2AndBelow();
    }
    hasContentH2AndBelow() {
        return this.blockContent.subTitleIndex != undefined || this.hasContentH3AndBelow();
    }
    hasContentH3AndBelow() {
        return this.blockContent.h3Index != undefined || this.hasContentH4AndBelow();
    }
    hasContentH4AndBelow() {
        return this.blockContent.h4Index != undefined || this.hasContentH5AndBelow();
    }
    hasContentH5AndBelow() {
        return this.blockContent.h5Index != undefined || this.hasContentH6AndBelow();
    }
    hasContentH6AndBelow() {
        return this.blockContent.h6Index != undefined ||
            this.blockContent.htmlStream
                .filter((e) => e.rawTagName != "h1" &&
                e.rawTagName != "h2" &&
                e.rawTagName != "h3" &&
                e.rawTagName != "h4" &&
                e.rawTagName != "h5" &&
                e.rawTagName != "h6").length > 0;
    }
    hasContent() {
        return this.hasContentH1AndBelow();
    }
    addTitle(childNode, res) {
        let bl = this;
        if (this.hasContentH1AndBelow()) {
            res.push(this.createContentBlock(res.length));
            bl = new BlockHolder(this.ns, this.lng, this.blockDefYaml);
        }
        bl.blockContent.titleIndex = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }
    addSubTitle(childNode, res) {
        let bl = this;
        if (this.hasContentH2AndBelow()) {
            res.push(this.createContentBlock(res.length));
            bl = new BlockHolder(this.ns, this.lng, this.blockDefYaml);
        }
        bl.blockContent.subTitleIndex = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }
    addH3(childNode, res) {
        let bl = this;
        if (this.hasContentH3AndBelow()) {
            res.push(this.createContentBlock(res.length));
            bl = new BlockHolder(this.ns, this.lng, this.blockDefYaml);
        }
        bl.blockContent.h3Index = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }
    addH4(childNode, res) {
        let bl = this;
        if (this.hasContentH4AndBelow()) {
            res.push(this.createContentBlock(res.length));
            bl = new BlockHolder(this.ns, this.lng, this.blockDefYaml);
        }
        bl.blockContent.h4Index = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }
    addH5(childNode, res) {
        let bl = this;
        if (this.hasContentH5AndBelow()) {
            res.push(this.createContentBlock(res.length));
            bl = new BlockHolder(this.ns, this.lng, this.blockDefYaml);
        }
        bl.blockContent.h5Index = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }
    addH6(childNode, res) {
        let bl = this;
        if (this.hasContentH6AndBelow()) {
            res.push(this.createContentBlock(res.length));
            bl = new BlockHolder(this.ns, this.lng, this.blockDefYaml);
        }
        bl.blockContent.h6Index = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }
    addYamlDefBlock(blockDefYaml, res) {
        if (this.blockDefYaml && this.hasContent()) {
            res.push(this.createContentBlock(res.length));
        }
        return new BlockHolder(this.ns, this.lng, blockDefYaml);
    }
    addParagraph(childNode) {
        this.blockContent.paragraphsIndex.push(this.blockContent.htmlStream.length);
        this.blockContent.htmlStream.push(childNode);
        return this;
    }
    addHorizontalLine(childNode) {
        this.blockContent.htmlStream.push(childNode);
        return this;
    }
    addImage(childNode) {
        this.blockContent.imagesIndex.push(this.blockContent.htmlStream.length);
        this.blockContent.htmlStream.push(childNode);
        return this;
    }
    createContentBlock(blockIndex) {
        const loadedBlockDef = yaml.load(this.blockDefYaml);
        const blockDef = loadedBlockDef["nd-block"];
        const blockId = blockDef.id ? blockDef.id : `block-${blockIndex}`;
        const attributes = blockDef.attributes;
        const tags = blockDef.tags;
        const newBlock = new NdContentBlock(blockId, this.ns, this.lng);
        newBlock.attributes = Object.keys(attributes).map(k => { return { key: k, value: attributes[k] }; });
        if (newBlock.attributes) {
            newBlock.attributes.push({ key: "id", value: blockId });
        }
        newBlock.tags = tags?.slice();
        // console.log("creating block: ", this.blockContent.paragraphsIndex)
        let pi = 0;
        let imi = 0;
        this.blockContent.htmlStream.forEach((htmlElem, i) => {
            let text = undefined;
            if (i === this.blockContent.titleIndex) {
                newBlock.title = new NdTranslatedText(this.ns, `${blockId}.title`, htmlElem.innerHTML);
                text = newBlock.title;
            }
            else if (i === this.blockContent.subTitleIndex) {
                newBlock.subTitle = new NdTranslatedText(this.ns, `${blockId}.subTitle`, htmlElem.innerHTML);
                text = newBlock.subTitle;
            }
            else if (i === this.blockContent.h3Index) {
                newBlock.h3 = new NdTranslatedText(this.ns, `${blockId}.h3`, htmlElem.innerHTML);
                text = newBlock.h3;
            }
            else if (i === this.blockContent.h4Index) {
                newBlock.h4 = new NdTranslatedText(this.ns, `${blockId}.h4`, htmlElem.innerHTML);
                text = newBlock.h4;
            }
            else if (i === this.blockContent.h5Index) {
                newBlock.h5 = new NdTranslatedText(this.ns, `${blockId}.h5`, htmlElem.innerHTML);
                text = newBlock.h5;
            }
            else if (i === this.blockContent.h6Index) {
                newBlock.h6 = new NdTranslatedText(this.ns, `${blockId}.h6`, htmlElem.innerHTML);
                text = newBlock.h6;
            }
            else if (this.blockContent.paragraphsIndex.indexOf(i) >= 0) {
                const para = this.parseParagraph(blockId, htmlElem, pi);
                if (para) {
                    newBlock.paragraphs.push(para);
                    text = para;
                    pi++;
                }
            }
            else if (this.blockContent.imagesIndex.indexOf(i) >= 0) {
                let img = undefined;
                if (htmlElem.rawTagName === "figure" && htmlElem.childNodes) {
                    /*
                     * extract image from <figure>
                     */
                    htmlElem.childNodes
                        .forEach((cn) => {
                        const imgHtmlElem = cn;
                        if (imgHtmlElem.rawTagName == "img") {
                            img = new NdContentImage();
                            img.url = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.url`, imgHtmlElem.attributes["src"], true);
                            img.alt = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.alt`, imgHtmlElem.attributes["alt"]);
                            img.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, imgHtmlElem.attributes["title"]);
                        }
                    });
                    if (img) {
                        htmlElem.childNodes
                            .forEach((cn) => {
                            if (cn.rawTagName == "figcaption") {
                                img.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, cn.innerHTML);
                            }
                        });
                    }
                }
                else if (htmlElem.rawTagName === "img") {
                    /*
                     * extract image from <img>
                     */
                    img = new NdContentImage();
                    img.url = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.url`, htmlElem.attributes["src"], true);
                    img.alt = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.alt`, htmlElem.attributes["alt"]);
                    img.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, htmlElem.attributes["title"]);
                }
                if (img) {
                    newBlock.images.push(img);
                    text = img;
                    imi++;
                }
            }
            else {
                text = new NdTranslatedText(this.ns, `${blockId}.htmlElements.${newBlock.htmlElements.length}`, "");
            }
            newBlock.htmlElements.push({ htmlElem: htmlElem, translatedText: text });
        });
        if (this.blockContent.footer && this.blockContent.footer.trim().length > 0) {
            newBlock.footer = new NdTranslatedText(this.ns, `${blockId}.footer`, this.blockContent.footer);
        }
        if (this.blockContent.bgImage && this.blockContent.bgImage.getAttribute("src")) {
            newBlock.bgImageUrl = new NdTranslatedText(this.ns, `${blockId}.bgImageUrl`, this.blockContent.bgImage.getAttribute("src"), true);
        }
        // console.log("added block", newBlock)
        return newBlock;
    }
    parseParagraph(blockId, p, pi) {
        if (p.rawTagName === "p" || p.rawTagName === "blockquote") {
            return new NdTranslatedText(this.ns, `${blockId}.paragraphs.${pi}`, p.innerHTML);
        }
        else if (p.rawTagName === "pre") {
            const codeHtml = p.childNodes[0];
            const rawText = codeHtml.text;
            const rCode = codePattern.exec(rawText);
            if (rCode) {
                return new NdCode(rCode[1], rCode[2]);
            }
            else {
                return undefined;
            }
        }
        else if (p.rawTagName === "ol") {
            return NdList.createOrdered(p.childNodes
                .filter(lin => lin.innerText && lin.innerText.trim().length > 0)
                .map((lin, k) => {
                const li = lin;
                return new NdTranslatedText(this.ns, `${blockId}.paragraphs.${pi}.items.${k}`, li.innerHTML);
            }));
        }
        else if (p.rawTagName === "ul") {
            return NdList.createUnOrdered(p.childNodes
                .filter(lin => lin.innerText && lin.innerText.trim().length > 0)
                .map((lin, k) => {
                const li = lin;
                return new NdTranslatedText(this.ns, `${blockId}.paragraphs.${pi}.items.${k}`, li.innerHTML);
            }));
        }
        console.log("couldn't parse paragraph: ", p);
        return undefined;
    }
}
export function parseMarkdownAsContent(fileContents, contentLng, ns) {
    Marked.setOptions({ isNoP: true });
    const res = [];
    let currentBlock = new BlockHolder(ns, contentLng);
    const mdParsed = Marked.parse(fileContents);
    const root = parse(mdParsed);
    root.childNodes.forEach(cn => {
        const childNode = cn;
        if (childNode.rawTagName === "h1") {
            currentBlock = currentBlock.addTitle(childNode, res);
        }
        else if (childNode.rawTagName === "h2") {
            currentBlock = currentBlock.addSubTitle(childNode, res);
        }
        else if (childNode.rawTagName === "h3") {
            currentBlock = currentBlock.addH3(childNode, res);
        }
        else if (childNode.rawTagName === "h4") {
            currentBlock = currentBlock.addH4(childNode, res);
        }
        else if (childNode.rawTagName === "h5") {
            currentBlock = currentBlock.addH5(childNode, res);
        }
        else if (childNode.rawTagName === "h6") {
            currentBlock = currentBlock.addH6(childNode, res);
        }
        else if (childNode.rawTagName === "pre") {
            if (childNode.innerHTML.startsWith("<code class=\"lang-yaml\">nd-block:")) {
                const codeHtml = childNode.childNodes[0];
                const rawText = codeHtml.text;
                const rCode = codePattern.exec(rawText);
                if (rCode) {
                    currentBlock = currentBlock.addYamlDefBlock(rCode[2], res);
                }
            }
            else {
                currentBlock.addParagraph(childNode);
            }
        }
        else if (childNode.rawTagName === "hr") {
            currentBlock.addHorizontalLine(childNode);
        }
        else if (childNode.rawTagName === "ul") {
            currentBlock.addParagraph(childNode);
        }
        else if (childNode.rawTagName === "ol") {
            currentBlock.addParagraph(childNode);
        }
        else if (childNode.rawTagName === "p" || childNode.rawTagName === "blockquote") {
            const rFooter = footerPattern.exec(childNode.innerHTML);
            if (rFooter) {
                currentBlock.blockContent.footer = rFooter[1];
            }
            else if (childNode.childNodes && childNode.childNodes.filter(cn => cn.rawTagName == "img").length > 0) {
                childNode.childNodes.filter(cn => cn.rawTagName == "img")
                    .forEach((cn) => {
                    const l = cn;
                    if (l.getAttribute("alt") === "bg-image") {
                        currentBlock.blockContent.bgImage = l;
                    }
                    else {
                        currentBlock.addImage(cn);
                    }
                });
            }
            else {
                currentBlock.addParagraph(childNode);
            }
        }
        else if (childNode.rawTagName === "figure") {
            currentBlock.addImage(childNode);
        }
        else if (childNode.innerHTML && childNode.innerHTML.trim().length > 0) {
            currentBlock.blockContent.htmlStream.push(childNode);
        }
    });
    if (currentBlock && currentBlock.blockDefYaml && currentBlock.hasContent()) {
        res.push(currentBlock.createContentBlock(res.length));
    }
    return res;
}
