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
    constructor(ns, lng) {
        this.ns = ns;
        this.lng = lng;
    }
    blockContent = { paragraphs: [], images: [] };
    createContentBlock(blockDefYaml, blockIndex) {
        const loadedBlockDef = yaml.load(blockDefYaml);
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
        if (this.blockContent.title && this.blockContent.title.trim().length > 0) {
            newBlock.title = new NdTranslatedText(this.ns);
            newBlock.title.key = `${blockId}.title`;
            newBlock.title.text = this.blockContent.title;
        }
        if (this.blockContent.subTitle && this.blockContent.subTitle.trim().length > 0) {
            newBlock.subTitle = new NdTranslatedText(this.ns);
            newBlock.subTitle.key = `${blockId}.subTitle`;
            newBlock.subTitle.text = this.blockContent.subTitle;
        }
        if (this.blockContent.footer && this.blockContent.footer.trim().length > 0) {
            newBlock.footer = new NdTranslatedText(this.ns);
            newBlock.footer.key = `${blockId}.footer`;
            newBlock.footer.text = this.blockContent.footer;
        }
        if (this.blockContent.bgImage && this.blockContent.bgImage.getAttribute("src")) {
            newBlock.bgImageUrl = new NdTranslatedText(this.ns);
            newBlock.bgImageUrl.key = `${blockId}.bgImageUrl`;
            newBlock.bgImageUrl.text = this.blockContent.bgImage.getAttribute("src");
        }
        newBlock.images = this.blockContent.images.map(im => {
            const innerP = im;
            // if (innerP.rawTagName == "img") {
            const imi = newBlock.images.length;
            const img = new NdContentImage();
            img.url = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.url`, innerP.attributes["src"]);
            img.alt = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.alt`, innerP.attributes["alt"]);
            img.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, innerP.attributes["title"]);
            // console.log("adding image ", img)
            return img;
        });
        newBlock.paragraphs = this.blockContent.paragraphs
            .map((p, pi) => {
            return this.parseParagraph(blockId, p, pi);
        })
            .filter((p) => p !== undefined)
            .map((p) => p);
        console.log("added block", newBlock);
        return newBlock;
    }
    parseParagraph(blockId, p, pi) {
        if (p.rawTagName === "p") {
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
                return new NdTranslatedText(this.ns, `${blockId}.paragraphs[${pi}].items.${k}`, li.innerHTML);
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
        return undefined;
    }
}
export function parseMarkdownAsContent(fileContents, contentLng, ns) {
    Marked.setOptions({ isNoP: true });
    const res = [];
    let currentBlock = new BlockHolder(ns, contentLng);
    const mdParsed = Marked.parse(fileContents);
    const root = parse(mdParsed);
    root.childNodes.forEach((cn, i) => {
        const childNode = cn;
        if (childNode.rawTagName === "h1") {
            currentBlock.blockContent.title = childNode.innerHTML;
        }
        if (childNode.rawTagName === "h2") {
            currentBlock.blockContent.subTitle = childNode.innerHTML;
        }
        if (childNode.rawTagName === "h3") {
            currentBlock.blockContent.h3 = childNode.innerHTML;
        }
        if (childNode.rawTagName === "h4") {
            currentBlock.blockContent.h4 = childNode.innerHTML;
        }
        if (childNode.rawTagName === "h5") {
            currentBlock.blockContent.h5 = childNode.innerHTML;
        }
        if (childNode.rawTagName === "h6") {
            currentBlock.blockContent.h6 = childNode.innerHTML;
        }
        if (childNode.rawTagName === "pre") {
            if (childNode.innerHTML.startsWith("<code class=\"lang-yaml\">nd-block:")) {
                const codeHtml = childNode.childNodes[0];
                const rawText = codeHtml.text;
                const rCode = codePattern.exec(rawText);
                if (rCode) {
                    res.push(currentBlock.createContentBlock(rCode[2], res.length));
                    currentBlock = new BlockHolder(ns, contentLng);
                }
            }
            else {
                currentBlock.blockContent.paragraphs.push(childNode);
            }
        }
        if (childNode.rawTagName === "ul") {
            currentBlock.blockContent.paragraphs.push(childNode);
        }
        if (childNode.rawTagName === "ol") {
            currentBlock.blockContent.paragraphs.push(childNode);
        }
        if (childNode.rawTagName === "p") {
            const rFooter = footerPattern.exec(childNode.innerHTML);
            if (rFooter) {
                currentBlock.blockContent.footer = rFooter[1];
            }
            else if (childNode.childNodes && childNode.childNodes.filter(cn => cn.rawTagName == "img").length > 0) {
                childNode.childNodes.filter(cn => cn.rawTagName == "img")
                    .forEach((cn, i) => {
                    const l = cn;
                    console.log("this is found image ", l.getAttribute("src"), l.getAttribute("alt"));
                    if (l.getAttribute("alt") === "bg-image") {
                        currentBlock.blockContent.bgImage = l;
                    }
                    else {
                        currentBlock.blockContent.images.push(childNode.childNodes[i]);
                    }
                });
            }
            else {
                currentBlock.blockContent.paragraphs.push(childNode);
            }
        }
    });
    return res;
}
