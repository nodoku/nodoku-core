import { ComponentProvider, I18nextProvider, ImageUrlProvider } from "./providers";
import { NdContentBlock } from "../content/nd-content";
import { NdPageSkin } from "../skin/nd-skin";
export declare enum RenderingPriority {
    content_first = 0,
    skin_first = 1
}
export declare class RenderingPageProps {
    lng: string;
    renderingPriority: RenderingPriority;
    content: NdContentBlock[];
    componentProvider: ComponentProvider | undefined;
    skin: NdPageSkin | undefined;
    imageUrlProvider: ImageUrlProvider | undefined;
    i18nextProvider: I18nextProvider | undefined;
    constructor(lng: string, renderingPriority: RenderingPriority | undefined, content: NdContentBlock[], componentProvider: ComponentProvider | undefined, skin: NdPageSkin | undefined, imageUrlProvider: ImageUrlProvider | undefined, i18nextProvider: I18nextProvider | undefined);
}
