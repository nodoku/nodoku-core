import {ComponentProvider, I18nextProvider, ImageUrlProvider} from "./providers";
import {NdContentBlock} from "../content/nd-content";
import {NdPageSkin} from "../skin/nd-skin";

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
    componentProvider: ComponentProvider | undefined = undefined;
    imageUrlProvider: ImageUrlProvider | undefined = undefined;
    i18nextProvider: I18nextProvider | undefined = undefined;

    constructor(lng: string,
                content: NdContentBlock[],
                componentProvider: ComponentProvider | undefined,
                skin: NdPageSkin | undefined = undefined,
                renderingPriority: RenderingPriority = RenderingPriority.content_first,
                imageUrlProvider: ImageUrlProvider | undefined = undefined,
                i18nextProvider: I18nextProvider | undefined = undefined) {

        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.content = content;
        this.componentProvider = componentProvider;
        this.skin = skin;
        this.imageUrlProvider = imageUrlProvider;
        this.i18nextProvider = i18nextProvider;
    }
}