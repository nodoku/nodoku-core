import { ComponentProvider, I18nextProvider } from "./providers";
import { NdContent } from "../content/nd-content";
import { NdPageSkin } from "../skin/nd-skin";
export declare enum RenderingPriority {
    content_first = 0,
    skin_first = 1
}
export declare class RenderingPageProps {
    lng: string;
    renderingPriority: RenderingPriority;
    i18nextProvider: I18nextProvider;
    content: NdContent;
    skin: NdPageSkin | undefined;
    componentProvider: ComponentProvider;
    constructor(lng: string, renderingPriority: RenderingPriority | undefined, i18nextProvider: I18nextProvider, content: NdContent, skin: NdPageSkin | undefined, componentProvider: ComponentProvider);
}
