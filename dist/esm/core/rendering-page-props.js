export var RenderingPriority;
(function (RenderingPriority) {
    RenderingPriority[RenderingPriority["content_first"] = 0] = "content_first";
    RenderingPriority[RenderingPriority["skin_first"] = 1] = "skin_first";
})(RenderingPriority || (RenderingPriority = {}));
export class RenderingPageProps {
    // pageName: string;
    lng;
    renderingPriority;
    i18nextProvider;
    content;
    skin;
    // contentYamlProvider: ContentYamlProvider;
    // visualYamlProvider: VisualYamlProvider;
    componentProvider;
    constructor(//pageName: string,
    lng, renderingPriority = RenderingPriority.content_first, i18nextProvider, content, skin, 
    // contentYamlProvider: ContentYamlProvider,
    // visualYamlProvider: VisualYamlProvider,
    componentProvider) {
        // this.pageName = pageName;
        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.i18nextProvider = i18nextProvider;
        // this.contentYamlProvider = contentYamlProvider;
        // this.visualYamlProvider = visualYamlProvider;
        this.content = content;
        this.skin = skin;
        this.componentProvider = componentProvider;
    }
}
