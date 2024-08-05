import { ComponentProvider, i18nextProvider } from "./providers";
import { NdContent } from "../content/nd-content";
import { NdPageSkin } from "../skin/nd-skin";
export declare enum RenderingPriority {
    content_first = 0,
    skin_first = 1
}
export declare class RenderingPageProps {
    lng: string;
    renderingPriority: RenderingPriority;
    i18nextProvider: i18nextProvider;
    content: NdContent;
    skin: NdPageSkin | undefined;
    componentProvider: ComponentProvider;
    constructor(//pageName: string,
    lng: string, renderingPriority: RenderingPriority | undefined, i18nextProvider: i18nextProvider, content: NdContent, skin: NdPageSkin | undefined, componentProvider: ComponentProvider);
}
