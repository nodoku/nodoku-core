import {ComponentProvider, I18nextProvider, ImageUrlProvider} from "./providers";
import {NdContentBlock} from "../content/nd-content";
import {NdPageSkin} from "../skin/nd-skin";

export enum RenderingPriority {
    content_first, skin_first
}

export class RenderingPageProps {
    lng: string;
    renderingPriority: RenderingPriority;
    content: NdContentBlock[];
    componentProvider: ComponentProvider | undefined;
    skin: NdPageSkin | undefined;
    imageUrlProvider: ImageUrlProvider | undefined = undefined;
    i18nextProvider: I18nextProvider | undefined = undefined;

    constructor(lng: string,
                renderingPriority: RenderingPriority = RenderingPriority.content_first,
                content: NdContentBlock[],
                componentProvider: ComponentProvider | undefined,
                skin: NdPageSkin | undefined,
                imageUrlProvider: ImageUrlProvider | undefined,
                i18nextProvider:I18nextProvider | undefined) {

        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.content = content;
        this.componentProvider = componentProvider;
        this.skin = skin;
        this.imageUrlProvider = imageUrlProvider;
        this.i18nextProvider = i18nextProvider;
    }
}