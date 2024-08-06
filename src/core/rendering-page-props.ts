import {ComponentProvider, I18nextProvider} from "./providers";
import {NdContent} from "../content/nd-content";
import {NdPageSkin} from "../skin/nd-skin";

export enum RenderingPriority {
    content_first, skin_first
}

export class RenderingPageProps {
    lng: string;
    renderingPriority: RenderingPriority;
    i18nextProvider: I18nextProvider;
    content: NdContent;
    skin: NdPageSkin | undefined;
    componentProvider: ComponentProvider;

    constructor(lng: string,
                renderingPriority: RenderingPriority = RenderingPriority.content_first,
                i18nextProvider:I18nextProvider,
                content: NdContent,
                skin: NdPageSkin | undefined,
                componentProvider: ComponentProvider) {

        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.i18nextProvider = i18nextProvider;
        this.content = content;
        this.skin = skin;
        this.componentProvider = componentProvider;
    }
}