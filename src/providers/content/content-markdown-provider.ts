import {NdTranslatableText, NdList, NdContentBlock, NdContentImage, NdCode} from "nodoku-core";
import { Marked } from '@ts-stack/markdown';
import {parse, HTMLElement, TextNode} from 'node-html-parser';
import yaml from "js-yaml";
import {NdCallToAction} from "../../content/nd-content";
import {NdParagraph} from "../../content/nd-content";
import {NdListItem} from "../../content/nd-content";
import {NdLink} from "../../content/nd-content";
import {Node} from "node-html-parser";


const nsRegex = /.*\/(.*)\.md/

export async function contentMarkdownProvider(mdFileUrl: string,
                                              contentLng: string,
                                              ns: string | undefined = undefined): Promise<NdContentBlock[]> {

    return await fetch(mdFileUrl)
        .then(response => response.text())
        .then(fileContent => {

            if (!ns) {
                const nsRes = nsRegex.exec(mdFileUrl);
                if (nsRes && nsRes.length > 0) {
                    ns = nsRes[0]
                }
            }

            if (!ns) {
                ns = "default"
            }

            return parseMarkdownAsContent(fileContent, contentLng, ns)
        })
}


const callToActionPattern = /^\|(.*)\|/

const codePattern: RegExp = /<code class="lang-(\w+)">(.*)<\/code>/s


class BlockHolder {

    blockIndex: number;
    blockDefIndex: number;

    ns: string;
    lng: string;
    blockDefYaml?: string;

    constructor(ns: string,
                lng: string,
                blockIndex: number,
                blockDefIndex: number,
                blockDefYaml: string | undefined = undefined) {
        
        this.ns = ns;
        this.lng = lng;
        this.blockDefYaml = blockDefYaml;
        this.blockIndex = blockIndex;
        this.blockDefIndex = blockDefIndex;
    }

    blockContent: {
        titleIndex?: number;
        subTitleIndex?: number;
        h3Index?: number;
        h4Index?: number;
        h5Index?: number;
        h6Index?: number;
        paragraphsIndex: number[];
        imagesIndex: number[];
        callToActionIndex: number[];
        htmlStream: HTMLElement[];
    } = {paragraphsIndex: [], imagesIndex: [], callToActionIndex: [], htmlStream: []};

    hasContentH1AndBelow(): boolean {
        return this.blockContent.titleIndex != undefined || this.hasContentH2AndBelow();
    }

    hasContentH2AndBelow(): boolean {
        return this.blockContent.subTitleIndex != undefined || this.hasContentH3AndBelow();
    }

    hasContentH3AndBelow(): boolean {
        return this.blockContent.h3Index != undefined || this.hasContentH4AndBelow();
    }

    hasContentH4AndBelow(): boolean {
        return this.blockContent.h4Index != undefined || this.hasContentH5AndBelow();
    }

    hasContentH5AndBelow(): boolean {
        return this.blockContent.h5Index != undefined || this.hasContentH6AndBelow();
    }

    hasContentH6AndBelow(): boolean {
        return this.blockContent.h6Index != undefined ||
            this.blockContent.htmlStream
                .filter((e: HTMLElement) =>
                    e.rawTagName != "h1" &&
                    e.rawTagName != "h2" &&
                    e.rawTagName != "h3" &&
                    e.rawTagName != "h4" &&
                    e.rawTagName != "h5" &&
                    e.rawTagName != "h6").length > 0;
    }

    hasContent(): boolean {
        return this.hasContentH1AndBelow();
    }

    addTitle(childNode: HTMLElement, res: NdContentBlock[]): BlockHolder {
        let bl: BlockHolder = this;
        if (this.hasContentH1AndBelow()) {
            res.push(this.createContentBlock())
            bl = new BlockHolder(this.ns, this.lng, this.blockIndex + 1, this.blockDefIndex + 1, this.blockDefYaml);
        }
        bl.blockContent.titleIndex = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode)
        return bl;
    }

    addSubTitle(childNode: HTMLElement, res: NdContentBlock[]): BlockHolder {
        let bl: BlockHolder = this;
        if (this.hasContentH2AndBelow()) {
            res.push(this.createContentBlock())
            bl = new BlockHolder(this.ns, this.lng, this.blockIndex + 1, this.blockDefIndex + 1, this.blockDefYaml);
        }
        bl.blockContent.subTitleIndex = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }

    addH3(childNode: HTMLElement, res: NdContentBlock[]): BlockHolder {
        let bl: BlockHolder = this;
        if (this.hasContentH3AndBelow()) {
            res.push(this.createContentBlock())
            bl = new BlockHolder(this.ns, this.lng, this.blockIndex + 1, this.blockDefIndex + 1, this.blockDefYaml);
        }
        bl.blockContent.h3Index = bl.blockContent.htmlStream.length; //childNode.innerHTML;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }

    addH4(childNode: HTMLElement, res: NdContentBlock[]): BlockHolder {
        let bl: BlockHolder = this;
        if (this.hasContentH4AndBelow()) {
            res.push(this.createContentBlock())
            bl = new BlockHolder(this.ns, this.lng, this.blockIndex + 1, this.blockDefIndex + 1, this.blockDefYaml);
        }
        bl.blockContent.h4Index = bl.blockContent.htmlStream.length;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }

    addH5(childNode: HTMLElement, res: NdContentBlock[]): BlockHolder {
        let bl: BlockHolder = this;
        if (this.hasContentH5AndBelow()) {
            res.push(this.createContentBlock())
            bl = new BlockHolder(this.ns, this.lng, this.blockIndex + 1, this.blockDefIndex + 1, this.blockDefYaml);
        }
        bl.blockContent.h5Index = bl.blockContent.htmlStream.length;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }

    addH6(childNode: HTMLElement, res: NdContentBlock[]): BlockHolder {
        let bl: BlockHolder = this;
        if (this.hasContentH6AndBelow()) {
            res.push(this.createContentBlock())
            bl = new BlockHolder(this.ns, this.lng, this.blockIndex + 1, this.blockDefIndex + 1, this.blockDefYaml);
        }
        bl.blockContent.h6Index = bl.blockContent.htmlStream.length;
        bl.blockContent.htmlStream.push(childNode);
        return bl;
    }

    addParagraph(childNode: HTMLElement): BlockHolder {
        this.blockContent.paragraphsIndex.push(this.blockContent.htmlStream.length);
        this.blockContent.htmlStream.push(childNode);
        return this;
    }

    addCallToAction(childNode: HTMLElement): BlockHolder {
        this.blockContent.callToActionIndex.push(this.blockContent.htmlStream.length);
        // console.log("adding html for cta", childNode.innerHTML)
        this.blockContent.htmlStream.push(childNode);
        return this;
    }

    addHorizontalLine(childNode: HTMLElement) {
        this.blockContent.htmlStream.push(childNode);
        return this;
    }

    addImage(childNode: HTMLElement): BlockHolder {
        this.blockContent.imagesIndex.push(this.blockContent.htmlStream.length);
        this.blockContent.htmlStream.push(childNode);
        return this;
    }

    addYamlDefBlock(blockDefYaml: string, res: NdContentBlock[]): BlockHolder {
        if (this.blockDefYaml && this.hasContent()) {
            res.push(this.createContentBlock())
        }
        return new BlockHolder(this.ns, this.lng, this.blockIndex + 1, 0, blockDefYaml);
    }

    private createBlockId(blockIndex: number, blockDefIndex: number, blockDef: any): string {
        if (blockDef.id) {
            return blockDef.id;
        }
        if (blockDef.attributes) {
            const prefix = Object.keys(blockDef.attributes).map(k => {return `${k}=${blockDef.attributes[k]}`;}).join(",")
            return `${prefix}-block-${blockDefIndex}`
        }
        return `block-${blockIndex}`
    }

    createContentBlock(): NdContentBlock {

        const loadedBlockDef: any = yaml.load(this.blockDefYaml!);
        const blockDef = loadedBlockDef["nd-block"]
        const blockId = this.createBlockId(this.blockIndex, this.blockDefIndex, blockDef);
        const attributes = blockDef.attributes;
        const tags = blockDef.tags

        const newBlock: NdContentBlock = new NdContentBlock(blockId, this.ns, this.lng)
        newBlock.attributes = Object.keys(attributes).map(k => {return {key: k, value: attributes[k]};});
        if (newBlock.attributes) {
            newBlock.attributes.push({key: "id", value: blockId});
        }
        newBlock.tags = tags?.slice();

        // console.log("creating block: ", this.blockContent.paragraphsIndex)

        let pi = 0;
        let imi = 0
        let ci = 0
        this.blockContent.htmlStream.forEach((htmlElem: HTMLElement, i: number) => {

            let text: (NdTranslatableText | NdContentImage | NdList | NdCode | NdCallToAction | undefined) = undefined;

            if (i === this.blockContent.titleIndex) {
                newBlock.title = new NdTranslatableText(this.ns, `${blockId}.title`, htmlElem.innerHTML);
                text = newBlock.title;
            } else if (i === this.blockContent.subTitleIndex) {
                newBlock.subTitle = new NdTranslatableText(this.ns, `${blockId}.subTitle`, htmlElem.innerHTML);
                text = newBlock.subTitle
            } else if (i === this.blockContent.h3Index) {
                newBlock.h3 = new NdTranslatableText(this.ns, `${blockId}.h3`, htmlElem.innerHTML)
                text = newBlock.h3
            } else if (i === this.blockContent.h4Index) {
                newBlock.h4 = new NdTranslatableText(this.ns, `${blockId}.h4`, htmlElem.innerHTML)
                text = newBlock.h4
            } else if (i === this.blockContent.h5Index) {
                newBlock.h5 = new NdTranslatableText(this.ns, `${blockId}.h5`, htmlElem.innerHTML)
                text = newBlock.h5
            } else if (i === this.blockContent.h6Index) {
                newBlock.h6 = new NdTranslatableText(this.ns, `${blockId}.h6`, htmlElem.innerHTML)
                text = newBlock.h6
            } else if (this.blockContent.paragraphsIndex.indexOf(i) >= 0) {

                const para: NdParagraph | undefined = this.parseParagraph(`${blockId}.paragraphs.${pi}`, htmlElem);
                if (para) {
                    newBlock.paragraphs.push(para);
                    text = para
                    pi++;
                }
            } else if (this.blockContent.imagesIndex.indexOf(i) >= 0) {
                let img: NdContentImage | undefined = undefined;

                if (htmlElem.rawTagName === "figure" && htmlElem.childNodes) {
                    /*
                     * extract image from <figure>
                     */
                    htmlElem.childNodes
                        .forEach((cn) => {
                            const imgHtmlElem: HTMLElement = cn as HTMLElement;
                            if (imgHtmlElem.rawTagName == "img") {
                                img = new NdContentImage()
                                img.url = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.url`, imgHtmlElem.attributes["src"], true);
                                img.alt = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.alt`, imgHtmlElem.attributes["alt"]);
                                img.title = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.title`, imgHtmlElem.attributes["title"]);
                            }
                        })
                    if (img) {
                        htmlElem.childNodes
                            .forEach((cn) => {
                                if (cn.rawTagName == "figcaption") {
                                    img!.title = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.title`, (cn as HTMLElement).innerHTML);
                                }
                            })
                    }
                } else if (htmlElem.rawTagName === "img") {
                    /*
                     * extract image from <img>
                     */
                    img = new NdContentImage();
                    img.url = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.url`, htmlElem.attributes["src"], true);
                    img.alt = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.alt`, htmlElem.attributes["alt"]);
                    img.title = new NdTranslatableText(this.ns, `${blockId}.images.${imi}.title`, htmlElem.attributes["title"]);
                }

                if (img) {
                    newBlock.images.push(img)
                    text = img;
                    imi++;
                }
            } else if (this.blockContent.callToActionIndex.indexOf(i) >= 0) {

                const cta: NdCallToAction | undefined = this.parseCallToAction(blockId, htmlElem, ci);
                if (cta) {
                    newBlock.callToActions.push(cta);
                    text = cta
                    ci++;
                    // console.log("added call to action: ", cta)
                }
            } else {
                text = new NdTranslatableText(this.ns, `${blockId}.htmlElements.${newBlock.htmlElements.length}`, "")
            }

            newBlock.htmlElements.push({htmlElem: htmlElem, translatedText: text!});

        });

        // if (this.blockContent.footer && this.blockContent.footer.trim().length > 0) {
        //     newBlock.footer = new NdTranslatableText(this.ns, `${blockId}.footer`, this.blockContent.footer);
        // }


        return newBlock;
    }

    parseCallToAction(blockId: string, ctaHtml: HTMLElement, ci: number): NdCallToAction | undefined {
        const cta: NdCallToAction = new NdCallToAction();

        // console.log("parsing callToAction", ctaHtml.innerHTML, ctaHtml.rawTagName, ctaHtml.attributes, ctaHtml.childNodes.map(cn => cn.rawTagName));
        // const res = callToActionPattern.exec(ctaHtml.innerHTML)

        const cnRef = ctaHtml.childNodes.find(cn => cn.rawTagName === "a")
        let url = "n/a"
        let title = ctaHtml.innerHTML;
        if (cnRef) {
            url = (cnRef as HTMLElement).getAttribute("href") || url;
            title = cnRef.textContent;
        }

        cta.ctaUrl = new NdTranslatableText(this.ns, `${blockId}.callToActions.${ci}.ctaUrl`, url);
        cta.ctaTitle = new NdTranslatableText(this.ns, `${blockId}.callToActions.${ci}.ctaTitle`, title);

        // console.log("returnin created cta: ", cta)

        return cta;
    }

    parseParagraph(idPrefix: string, cn: Node): NdParagraph | undefined {

        if (!cn) {
            return undefined;
        }

        if (cn instanceof TextNode) {
            return new NdTranslatableText(this.ns, `${idPrefix}`, (cn as TextNode).text);
        }


        const p = cn as HTMLElement;

        if (!p.rawTagName) {
            return undefined;
        }

        // console.log("parsing paragraph", p.innerHTML);

        if (p.rawTagName === "p" || p.rawTagName === "blockquote") {
            return new NdTranslatableText(this.ns, `${idPrefix}`, p.innerHTML);
        } else if (p.rawTagName === "a") {


            return new NdLink(
                new NdTranslatableText(this.ns, `${idPrefix}.urlText`, p.innerHTML),
                new NdTranslatableText(this.ns, `${idPrefix}.url`, p.attributes["href"], true)
            );
        } else if (p.rawTagName === "pre") {
            const codeHtml: TextNode = p.childNodes[0] as TextNode;
            const rawText = codeHtml.text;
            const rCode = codePattern.exec(rawText);
            if (rCode) {
                return new NdCode(rCode[1], rCode[2])
            } else {
                return undefined;
            }
        } else if (p.rawTagName === "ol") {
            return NdList.createOrdered(this.parseListItems(idPrefix, p));
        } else if (p.rawTagName === "ul") {
            return NdList.createUnOrdered(this.parseListItems(idPrefix, p));
        } /*else {
            return new NdTranslatableText(this.ns, `${idPrefix}`, p.innerHTML);
        }*/

        console.log("couldn't parse paragraph: ", p.innerHTML)

        return undefined;
    }

    private parseListItems(idPrefix: string, p: HTMLElement): NdListItem[] {
        return p.childNodes
            .filter(lin => lin.innerText && lin.innerText.trim().length > 0)
            .map((lin, k: number) => {
                const li: HTMLElement = lin as HTMLElement;
                let innerList = undefined;
                let liText: NdTranslatableText | NdLink | undefined;//TextNode | undefined;
                if (li.childNodes.length > 0) {
                    // console.log("found inner item", li.childNodes.length, (li.childNodes.map(i => i as HTMLElement)
                    //     .map((i1: HTMLElement) => i1.rawTagName ? i1.rawTagName : "N.A")), "<<<");
                    //
                    // console.log("found inner list", li.childNodes[0].innerText)

                    innerList = li.childNodes
                        .map(cn => this.parseParagraph(`${idPrefix}.items.${k}.subList`, cn))
                        .find((p: NdParagraph | undefined) => p != undefined && p instanceof NdList)
                    liText = li.childNodes
                        .map(cn => this.parseParagraph(`${idPrefix}.items.${k}.text`, cn))
                        .find((p: NdParagraph | undefined) => p != undefined && (p instanceof NdLink || p instanceof NdTranslatableText))
                    // innerList = innerNodes.find((p: NdParagraph | undefined) => p != undefined && p instanceof NdList)
                    // if (li.childNodes[0].rawTagName in ["ol", "ul"]) {
                    // }
                    // liText = li.childNodes.filter(cn => cn instanceof TextNode).find(t => t && t.text.length > 0);
                    // liText = innerNodes.find((p: NdParagraph | undefined) => p != undefined && (p instanceof NdLink || p instanceof NdTranslatableText))
                }
                // type l = keyof HTMLElement
                // console.log("found list", li.childNodes.filter(cn => Object.keys(cn).map(k => k == "parentNode" ? "parent" : (cn as HTMLElement)[k as l])), "<<", lin.innerText, "<<")
                // const foundList = {text: new NdTranslatableText(this.ns, `${idPrefix}.items.${k}`, liText)/*liText*/, subList: innerList};
                const foundList = {text: liText ? liText : new NdTranslatableText(this.ns, `${idPrefix}.items.${k}`, "n/a"), subList: innerList};
                // console.log("found list", ">>", foundList, "<<")
                return foundList
                // const listItem = this.parseParagraph(`${idPrefix}.items.${k}`, li)
                // return listItem ? listItem : new NdTranslatableText(this.ns, `${idPrefix}.items.${k}`, "undefined list item" + li.innerHTML);
            }).filter(lin => lin != undefined)
    }


}



export function parseMarkdownAsContent(fileContents: string, contentLng: string, ns: string): NdContentBlock[] {

    Marked.setOptions({isNoP: true});

    const res: NdContentBlock[] = [];
    let currentBlock: BlockHolder  = new BlockHolder(ns, contentLng, 0, 0);

    const mdParsed = Marked.parse(fileContents);

    const root: HTMLElement = parse(mdParsed);

    root.childNodes.forEach(cn => {

        const childNode = cn as HTMLElement

        if (childNode.rawTagName === "h1") {
            currentBlock = currentBlock.addTitle(childNode, res);
        } else if (childNode.rawTagName === "h2") {
            currentBlock = currentBlock.addSubTitle(childNode, res);
        } else if (childNode.rawTagName === "h3") {
            currentBlock = currentBlock.addH3(childNode, res);
        } else if (childNode.rawTagName === "h4") {
            currentBlock = currentBlock.addH4(childNode, res);
        } else if (childNode.rawTagName === "h5") {
            currentBlock = currentBlock.addH5(childNode, res);
        } else if (childNode.rawTagName === "h6") {
            currentBlock = currentBlock.addH6(childNode, res);
        } else if (childNode.rawTagName === "pre") {
            if (childNode.innerHTML.startsWith("<code class=\"lang-yaml\">nd-block:")) {
                const codeHtml: TextNode = childNode.childNodes[0] as TextNode;
                const rawText = codeHtml.text;
                const rCode = codePattern.exec(rawText);
                if (rCode) {
                    currentBlock = currentBlock.addYamlDefBlock(rCode[2], res);
                }
            } else {
                currentBlock.addParagraph(childNode);
            }
        } else if (childNode.rawTagName === "hr") {
            currentBlock.addHorizontalLine(childNode)
        } else if (childNode.rawTagName === "ul") {
            currentBlock.addParagraph(childNode)
        } else if (childNode.rawTagName === "ol") {
            currentBlock.addParagraph(childNode)
        } else if (childNode.rawTagName === "p" || childNode.rawTagName === "blockquote") {

            if (childNode.childNodes &&
                childNode.childNodes.filter(cn => cn.rawTagName == "img").length > 0) {
                childNode.childNodes.filter(cn => cn.rawTagName == "img")
                    .forEach((cn) => {
                        currentBlock.addImage(cn as HTMLElement)
                    });
            } else {
                const rCta = callToActionPattern.exec(childNode.innerHTML);
                if (rCta) {

                    // console.log("cta childNode", childNode)

                    currentBlock.addCallToAction(childNode);
                } else {
                    currentBlock.addParagraph(childNode)
                }
            }

        } else if (childNode.rawTagName === "figure") {
            currentBlock.addImage(childNode)
        } else if (childNode.innerHTML && childNode.innerHTML.trim().length > 0) {
            currentBlock.blockContent.htmlStream.push(childNode)
        }

    })

    if (currentBlock && currentBlock.blockDefYaml && currentBlock.hasContent()) {
        res.push(currentBlock.createContentBlock())
    }

    return res;
}

