import { ComponentProvider, ContentYamlProvider, i18nextProvider, VisualYamlProvider } from "../content/providers";
export declare class RenderingPageProps {
    pageName: string;
    lng: string;
    i18nextProvider: i18nextProvider;
    contentYamlProvider: ContentYamlProvider;
    visualYamlProvider: VisualYamlProvider;
    componentProvider: ComponentProvider;
    constructor(pageName: string, lng: string, i18nextProvider: i18nextProvider, contentYamlProvider: ContentYamlProvider, visualYamlProvider: VisualYamlProvider, componentProvider: ComponentProvider);
}
