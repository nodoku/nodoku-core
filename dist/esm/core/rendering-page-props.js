export var RenderingPriority;
(function (RenderingPriority) {
    RenderingPriority[RenderingPriority["content_first"] = 0] = "content_first";
    RenderingPriority[RenderingPriority["skin_first"] = 1] = "skin_first";
})(RenderingPriority || (RenderingPriority = {}));
export class RenderingPageProps {
    lng;
    renderingPriority;
    i18nextProvider;
    content;
    skin;
    componentProvider;
    constructor(lng, renderingPriority = RenderingPriority.content_first, i18nextProvider, content, skin, componentProvider) {
        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.i18nextProvider = i18nextProvider;
        this.content = content;
        this.skin = skin;
        this.componentProvider = componentProvider;
    }
}
