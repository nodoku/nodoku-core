import { ComponentResolver, NdI18nextProvider, NdImageProvider } from "./providers";
import { NdContentBlock } from "../content/nd-content";
import { NdPageSkin } from "../skin/nd-skin";
import { NdI18NextPostProcessor } from "./providers";
import { NdHtmlSanitizer } from "./providers";
import { NdClientSideComponentProvider } from "./providers";
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
    imageProvider: NdImageProvider | undefined;
    i18nextProvider: NdI18nextProvider | undefined;
    i18nextPostProcessor: NdI18NextPostProcessor | undefined;
    htmlSanitizer: NdHtmlSanitizer | undefined;
    clientSideComponentProvider: NdClientSideComponentProvider | undefined;
    constructor(lng: string, content: NdContentBlock[], componentResolver: ComponentResolver | undefined, skin?: NdPageSkin | undefined, renderingPriority?: RenderingPriority, imageProvider?: NdImageProvider | undefined, i18nextProvider?: NdI18nextProvider | undefined, htmlSanitizer?: NdHtmlSanitizer | undefined, clientSideComponentProvider?: NdClientSideComponentProvider | undefined);
}
