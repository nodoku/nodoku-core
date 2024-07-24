export class RenderingPageProps {
    pageName;
    lng;
    i18nextProvider;
    contentYamlProvider;
    visualYamlProvider;
    componentProvider;
    constructor(pageName, lng, i18nextProvider, contentYamlProvider, visualYamlProvider, componentProvider) {
        this.pageName = pageName;
        this.lng = lng;
        this.i18nextProvider = i18nextProvider;
        this.contentYamlProvider = contentYamlProvider;
        this.visualYamlProvider = visualYamlProvider;
        this.componentProvider = componentProvider;
    }
}
