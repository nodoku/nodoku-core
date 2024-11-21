import { ComponentResolver, I18nextProvider, ImageProvider } from "./providers";
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
    componentResolver: ComponentResolver | undefined;
    imageProvider: ImageProvider | undefined;
    i18nextProvider: I18nextProvider | undefined;
    constructor(lng: string, content: NdContentBlock[], componentResolver: ComponentResolver | undefined, skin?: NdPageSkin | undefined, renderingPriority?: RenderingPriority, imageProvider?: ImageProvider | undefined, i18nextProvider?: I18nextProvider | undefined);
}
