import {NdTranslatedText, NdList, NdContentBlock, NdContentImage, NdCode} from "nodoku-core";
import { Marked } from '@ts-stack/markdown';
import {parse, HTMLElement, TextNode} from 'node-html-parser';
import yaml from "js-yaml";


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


const footerPattern = /^\|(.*)\|/

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
        footer?: string;
        bgImage?: HTMLElement;
        paragraphsIndex: number[];
        imagesIndex: number[];
        htmlStream: HTMLElement[];
    } = {paragraphsIndex: [], imagesIndex: [], htmlStream: []};

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
        this.blockContent.htmlStream.forEach((htmlElem: HTMLElement, i: number) => {

            let text: (NdTranslatedText | NdContentImage | NdList | NdCode | undefined) = undefined;

            if (i === this.blockContent.titleIndex) {
                newBlock.title = new NdTranslatedText(this.ns, `${blockId}.title`, htmlElem.innerHTML);
                text = newBlock.title;
            } else if (i === this.blockContent.subTitleIndex) {
                newBlock.subTitle = new NdTranslatedText(this.ns, `${blockId}.subTitle`, htmlElem.innerHTML);
                text = newBlock.subTitle
            } else if (i === this.blockContent.h3Index) {
                newBlock.h3 = new NdTranslatedText(this.ns, `${blockId}.h3`, htmlElem.innerHTML)
                text = newBlock.h3
            } else if (i === this.blockContent.h4Index) {
                newBlock.h4 = new NdTranslatedText(this.ns, `${blockId}.h4`, htmlElem.innerHTML)
                text = newBlock.h4
            } else if (i === this.blockContent.h5Index) {
                newBlock.h5 = new NdTranslatedText(this.ns, `${blockId}.h5`, htmlElem.innerHTML)
                text = newBlock.h5
            } else if (i === this.blockContent.h6Index) {
                newBlock.h6 = new NdTranslatedText(this.ns, `${blockId}.h6`, htmlElem.innerHTML)
                text = newBlock.h6
            } else if (this.blockContent.paragraphsIndex.indexOf(i) >= 0) {

                const para: NdTranslatedText | NdList | NdCode | undefined = this.parseParagraph(blockId, htmlElem, pi);
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
                                img.url = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.url`, imgHtmlElem.attributes["src"], true);
                                img.alt = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.alt`, imgHtmlElem.attributes["alt"]);
                                img.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, imgHtmlElem.attributes["title"]);
                            }
                        })
                    if (img) {
                        htmlElem.childNodes
                            .forEach((cn) => {
                                if (cn.rawTagName == "figcaption") {
                                    img!.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, (cn as HTMLElement).innerHTML);
                                }
                            })
                    }
                } else if (htmlElem.rawTagName === "img") {
                    /*
                     * extract image from <img>
                     */
                    img = new NdContentImage();
                    img.url = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.url`, htmlElem.attributes["src"], true);
                    img.alt = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.alt`, htmlElem.attributes["alt"]);
                    img.title = new NdTranslatedText(this.ns, `${blockId}.images.${imi}.title`, htmlElem.attributes["title"]);
                }

                if (img) {
                    newBlock.images.push(img)
                    text = img;
                    imi++;
                }
            } else {
                text = new NdTranslatedText(this.ns, `${blockId}.htmlElements.${newBlock.htmlElements.length}`, "")
            }

            newBlock.htmlElements.push({htmlElem: htmlElem, translatedText: text!});

        });

        if (this.blockContent.footer && this.blockContent.footer.trim().length > 0) {
            newBlock.footer = new NdTranslatedText(this.ns, `${blockId}.footer`, this.blockContent.footer);
        }

        if (this.blockContent.bgImage && this.blockContent.bgImage.getAttribute("src")) {
            newBlock.bgImageUrl = new NdTranslatedText(this.ns,  `${blockId}.bgImageUrl`,
                this.blockContent.bgImage.getAttribute("src") as string, true);
        }

        // console.log("added block", newBlock)

        return newBlock;
    }

    parseParagraph(blockId: string, p: HTMLElement, pi: number): NdTranslatedText | NdList | NdCode | undefined {
        if (p.rawTagName === "p" || p.rawTagName === "blockquote") {
            return new NdTranslatedText(this.ns, `${blockId}.paragraphs.${pi}`, p.innerHTML);
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
            return NdList.createOrdered(p.childNodes
                .filter(lin => lin.innerText && lin.innerText.trim().length > 0)
                .map((lin, k: number) => {
                    const li: HTMLElement = lin as HTMLElement;
                    return new NdTranslatedText(this.ns, `${blockId}.paragraphs.${pi}.items.${k}`, li.innerHTML)
                }));
        } else if (p.rawTagName === "ul") {
            return NdList.createUnOrdered(p.childNodes
                .filter(lin => lin.innerText && lin.innerText.trim().length > 0)
                .map((lin, k: number) => {
                    const li: HTMLElement = lin as HTMLElement;
                    return new NdTranslatedText(this.ns, `${blockId}.paragraphs.${pi}.items.${k}`, li.innerHTML)
                }));
        }

        console.log("couldn't parse paragraph: ", p)

        return undefined;
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

            const rFooter = footerPattern.exec(childNode.innerHTML);
            if (rFooter) {
                currentBlock.blockContent.footer = rFooter[1];
            } else if (childNode.childNodes && childNode.childNodes.filter(cn => cn.rawTagName == "img").length > 0) {
                childNode.childNodes.filter(cn => cn.rawTagName == "img")
                    .forEach((cn) => {
                        const l: HTMLElement = cn as HTMLElement

                        if (l.getAttribute("alt") === "bg-image") {
                            currentBlock.blockContent.bgImage = l;
                        } else {
                            currentBlock.addImage(cn as HTMLElement)
                        }
                    });
            } else {
                currentBlock.addParagraph(childNode)
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

