import {ComponentResolver, NdI18nextProvider, NdImageProvider} from "./providers";
import {NdContentBlock} from "../content/nd-content";
import {NdPageSkin} from "../skin/nd-skin";
import {NdI18NextPostProcessor} from "./providers";
import {NdHtmlSanitizer} from "./providers";

export enum RenderingPriority {
    /*
     * the content is rendered as it appears in the markdown file, sequentially, block by block, from top to bottom
     * if a visual component is configured in the skin Yaml file, this visual component is used for rendering the content block.
     * Otherwise a default visual component is used
     */
    content_first,

    /*
     * the rendering is fully prescribed by the skin Yaml file
     * The components are rendered in the order they appear in the Yaml file
     * If a content block is not matched by any of the visual components in the skin Yaml file, it is not rendered at all
     * If a content block matches more than one visual component, each visual component is rendered,
     * and the same content block will appear several times on the page
     */
    skin_first
}

export class RenderingPageProps {
    lng: string;
    content: NdContentBlock[];
    skin: NdPageSkin | undefined = undefined;
    renderingPriority: RenderingPriority = RenderingPriority.content_first;
    componentResolver: ComponentResolver | undefined = undefined;
    imageProvider: NdImageProvider | undefined = undefined;
    i18nextProvider: NdI18nextProvider | undefined = undefined;
    i18nextPostProcessor: NdI18NextPostProcessor | undefined
    htmlSanitizer: NdHtmlSanitizer | undefined

    constructor(lng: string,
                content: NdContentBlock[],
                componentResolver: ComponentResolver | undefined,
                skin: NdPageSkin | undefined = undefined,
                renderingPriority: RenderingPriority = RenderingPriority.content_first,
                imageProvider: NdImageProvider | undefined = undefined,
                i18nextProvider: NdI18nextProvider | undefined = undefined,
                htmlSanitizer: NdHtmlSanitizer | undefined = undefined) {

        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.content = content;
        this.componentResolver = componentResolver;
        this.skin = skin;
        this.imageProvider = imageProvider;
        this.i18nextProvider = i18nextProvider;
        this.htmlSanitizer = htmlSanitizer;
    }
}