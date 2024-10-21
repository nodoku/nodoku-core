export var RenderingPriority;
(function (RenderingPriority) {
    /*
     * the content is rendered as it appears in the markdown file, sequentially, block by block, from top to bottom
     * if a visual component is configured in the skin Yaml file, this visual component is used for rendering the content block.
     * Otherwise a default visual component is used
     */
    RenderingPriority[RenderingPriority["content_first"] = 0] = "content_first";
    /*
     * the rendering is fully prescribed by the skin Yaml file
     * The components are rendered in the order they appear in the Yaml file
     * If a content block is not matched by any of the visual components in the skin Yaml file, it is not rendered at all
     * If a content block matches more than one visual component, each visual component is rendered,
     * and the same content block will appear several times on the page
     */
    RenderingPriority[RenderingPriority["skin_first"] = 1] = "skin_first";
})(RenderingPriority || (RenderingPriority = {}));
export class RenderingPageProps {
    lng;
    content;
    skin = undefined;
    renderingPriority = RenderingPriority.content_first;
    componentProvider = undefined;
    imageUrlProvider = undefined;
    i18nextProvider = undefined;
    constructor(lng, content, componentProvider, skin = undefined, renderingPriority = RenderingPriority.content_first, imageUrlProvider = undefined, i18nextProvider = undefined) {
        this.lng = lng;
        this.renderingPriority = renderingPriority;
        this.content = content;
        this.componentProvider = componentProvider;
        this.skin = skin;
        this.imageUrlProvider = imageUrlProvider;
        this.i18nextProvider = i18nextProvider;
    }
}
