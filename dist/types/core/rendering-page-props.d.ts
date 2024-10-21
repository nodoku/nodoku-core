import { ComponentProvider, I18nextProvider, ImageUrlProvider } from "./providers";
import { NdContentBlock } from "../content/nd-content";
import { NdPageSkin } from "../skin/nd-skin";
export declare enum RenderingPriority {
    content_first = 0,
    skin_first = 1
}
export declare class RenderingPageProps {
    lng: string;
    content: NdContentBlock[];
    skin: NdPageSkin | undefined;
    renderingPriority: RenderingPriority;
    componentProvider: ComponentProvider | undefined;
    imageUrlProvider: ImageUrlProvider | undefined;
    i18nextProvider: I18nextProvider | undefined;
    constructor(lng: string, content: NdContentBlock[], componentProvider: ComponentProvider | undefined, skin?: NdPageSkin | undefined, renderingPriority?: RenderingPriority, imageUrlProvider?: ImageUrlProvider | undefined, i18nextProvider?: I18nextProvider | undefined);
}
