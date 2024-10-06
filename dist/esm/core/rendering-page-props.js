export var RenderingPriority;
(function (RenderingPriority) {
    RenderingPriority[RenderingPriority["content_first"] = 0] = "content_first";
    RenderingPriority[RenderingPriority["skin_first"] = 1] = "skin_first";
})(RenderingPriority || (RenderingPriority = {}));
export class RenderingPageProps {
    lng;
    renderingPriority;
    content;
    componentProvider;
    skin;
    imageUrlProvider = undefined;
    i18nextProvider = undefined;
    constructor(lng, renderingPriority = RenderingPriority.content_first, content, componentProvider, skin, imageUrlProvider, i18nextProvider) {
        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.content = content;
        this.componentProvider = componentProvider;
        this.skin = skin;
        this.imageUrlProvider = imageUrlProvider;
        this.i18nextProvider = i18nextProvider;
    }
}
