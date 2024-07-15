import {ComponentProvider, ContentYamlProvider, i18nextProvider, VisualYamlProvider} from "../content/providers";

export class RenderingPageProps {
    pageName: string;
    lng: string;
    i18nextProvider: i18nextProvider;
    contentYamlProvider: ContentYamlProvider;
    visualYamlProvider: VisualYamlProvider;
    componentProvider: ComponentProvider;



    constructor(pageName: string,
                lng: string,
                i18nextProvider:i18nextProvider,
                contentYamlProvider: ContentYamlProvider,
                visualYamlProvider: VisualYamlProvider,
                componentProvider: ComponentProvider) {

        this.pageName = pageName;
        this.lng = lng;
        this.i18nextProvider = i18nextProvider;
        this.contentYamlProvider = contentYamlProvider;
        this.visualYamlProvider = visualYamlProvider;
        this.componentProvider = componentProvider;
    }
}