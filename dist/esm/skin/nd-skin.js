import { mergeTheme } from "../theme-utils/theme-merger";
export class NdThemeHierarchy {
    defaultThemeName;
    globalTheme;
    globalThemes;
    componentOptions;
    componentTheme;
    componentThemes;
    options;
    theme;
    themes = [];
    constructor(defaultTheme = "light") {
        this.defaultThemeName = defaultTheme;
    }
    calculateEffectiveTheme(componentIndex, defaultTheme) {
        let effectiveTheme = mergeTheme(this.globalTheme, defaultTheme);
        let effectiveThemes = [];
        let effectiveOptions = {};
        if (this.globalThemes && this.globalThemes.length > 0) {
            effectiveTheme = mergeTheme(this.globalThemes[componentIndex % this.globalThemes?.length], effectiveTheme);
        }
        if (this.componentTheme) {
            effectiveTheme = mergeTheme(this.componentTheme, effectiveTheme);
        }
        if (this.componentThemes && this.componentThemes.length > 0) {
            effectiveThemes = this.componentThemes;
        }
        if (this.componentOptions) {
            effectiveOptions = mergeTheme(this.componentOptions, effectiveOptions);
        }
        if (this.theme) {
            effectiveTheme = mergeTheme(this.theme, effectiveTheme);
        }
        if (this.themes) {
            for (let i = 0; i < Math.min(effectiveThemes.length, this.themes.length); i += 1) {
                effectiveThemes[i] = mergeTheme(this.themes[i], effectiveThemes[i]);
            }
            if (this.themes.length > effectiveThemes.length) {
                for (let i = effectiveThemes.length; i < this.themes.length; i += 1) {
                    effectiveThemes.push(this.themes[i]);
                }
            }
        }
        if (this.options) {
            effectiveOptions = mergeTheme(this.options, effectiveOptions);
        }
        if (effectiveTheme) {
            effectiveTheme.defaultThemeName = this.defaultThemeName;
        }
        return { effectiveTheme, effectiveThemes, effectiveOptions };
    }
}
export class NdSkinComponent {
    rowIndex;
    componentIndex;
    defaultThemeName;
    themeHierarchy;
    componentName = "";
    selector;
    constructor(rowIndex, componentIndex, defaultThemeName, selector) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.defaultThemeName = defaultThemeName;
        this.selector = selector;
    }
}
export class NdRow {
    rowIndex;
    maxCols;
    theme;
    components = [];
    constructor(rowIndex) {
        this.rowIndex = rowIndex;
    }
}
export class NdPageSkin {
    renderingPage;
    rows = [];
}
export class NdContentSelector {
    attributes = [];
    tags = [];
    namespace = undefined;
    constructor(attributes, tags = [], namespace = undefined) {
        this.attributes = attributes ? attributes : [];
        this.tags = tags ? tags : [];
        this.namespace = namespace;
    }
    match(block) {
        // console.log("NdContentSelector attributes === ", this.attributes, this.tags, this.namespace);
        // console.log("NdContentSelector block attributes === ", block.attributes, block.tags);
        const attrMatch = this.attributes.filter(a1 => block.attributes && block.attributes.filter(a2 => a1.key == a2.key && a1.value == a2.value).length > 0).length;
        const tagsMatch = this.tags.filter(t1 => block.tags && block.tags.filter(t2 => t1 == t2).length > 0).length;
        const nsMatch = this.namespace ? this.namespace == block.namespace : true;
        return attrMatch == this.attributes.length && tagsMatch == this.tags.length && nsMatch;
    }
    filterBlocks(blocks) {
        return blocks.filter(b => this.match(b));
    }
}
export class NdComponentDefinition {
    numBlocks;
    defaultTheme;
    defaultThemeYaml;
    constructor(numBlocks, defaultThemeYaml = undefined, defaultTheme = undefined) {
        this.numBlocks = numBlocks;
        this.defaultTheme = defaultTheme;
        this.defaultThemeYaml = defaultThemeYaml;
    }
}
export class NdSkinComponentProps {
    rowIndex;
    componentIndex;
    content;
    defaultThemeName;
    theme;
    themes;
    options;
    lng;
    imageProvider;
    i18nextTrustedHtmlProvider;
    clientSideComponentProvider;
    constructor(rowIndex, componentIndex, content, defaultThemeName, theme, themes, options, lng, imageProvider, i18nextTrustedHtmlProvider, clientSideComponentProvider) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.content = content;
        this.defaultThemeName = defaultThemeName;
        this.theme = theme;
        this.themes = themes.slice();
        this.options = options;
        this.lng = lng;
        this.imageProvider = imageProvider;
        this.i18nextTrustedHtmlProvider = i18nextTrustedHtmlProvider;
        this.clientSideComponentProvider = clientSideComponentProvider;
    }
}
