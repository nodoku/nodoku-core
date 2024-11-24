import {I18nextProvider, ImageProvider} from "../core/providers";
import {NdContentBlock} from "../content/nd-content";
import {mergeTheme} from "../theme-utils/theme-merger";
import {ThemeStyle} from "../theme-utils/theme-style";
import {RowStyle} from "../theme-utils/row-style";

export type NdDefaultThemeName = "light" | "dark";

export class NdThemeHierarchy {
    defaultThemeName: NdDefaultThemeName;
    globalTheme: any | undefined;
    globalThemes: any[] | undefined;
    componentOptions: any | undefined;
    componentTheme: any | undefined;
    componentThemes: any[] | undefined;
    options: any;
    theme: any;
    themes: any[] = [];

    constructor(defaultTheme: NdDefaultThemeName = "light") {
        this.defaultThemeName = defaultTheme;
    }

    calculateEffectiveTheme(componentIndex: number, defaultTheme: any): {effectiveTheme: any, effectiveThemes: any[], effectiveOptions: any } {
        let effectiveTheme = mergeTheme(this.globalTheme, defaultTheme);
        let effectiveThemes: any[] = [];
        let effectiveOptions: any = {};

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

        return {effectiveTheme, effectiveThemes, effectiveOptions};

    }
}

export class NdSkinComponent {
    rowIndex: number;
    componentIndex: number;
    defaultThemeName: NdDefaultThemeName;
    themeHierarchy?: NdThemeHierarchy;
    componentName: string = "";
    selector: NdContentSelector;

    constructor(rowIndex: number, componentIndex: number, defaultThemeName: NdDefaultThemeName, selector: NdContentSelector) {
        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.defaultThemeName = defaultThemeName;
        this.selector = selector;
    }
}

export class NdRow {
    rowIndex: number;
    maxCols?: number;
    theme?: RowStyle;
    components: NdSkinComponent[] = [];

    constructor(rowIndex: number) {
        this.rowIndex = rowIndex;
    }

}


export class NdPageSkin {
    renderingPage: ThemeStyle | undefined;
    rows: NdRow[] = []
}

export class NdContentSelector {
    attributes: {key: string, value: string}[] = [];
    tags: string[] = []
    namespace: string | undefined = undefined;

    constructor(attributes: {key: string, value: string}[], tags: string[] = [], namespace: string | undefined = undefined) {
        this.attributes = attributes ? attributes : [];
        this.tags = tags ? tags : [];
        this.namespace = namespace;
    }

    match(block: NdContentBlock): boolean {

        // console.log("NdContentSelector attributes === ", this.attributes, this.tags, this.namespace);
        // console.log("NdContentSelector block attributes === ", block.attributes, block.tags);

        const attrMatch =
            this.attributes.filter(a1 =>
                block.attributes && block.attributes.filter(a2 =>
                    a1.key == a2.key && a1.value == a2.value).length > 0).length;

        const tagsMatch = this.tags.filter(t1 =>
            block.tags && block.tags.filter(t2 => t1 == t2).length > 0).length;

        const nsMatch = this.namespace ? this.namespace == block.namespace : true;

        return attrMatch == this.attributes.length && tagsMatch == this.tags.length && nsMatch;
    }

    filterBlocks(blocks: NdContentBlock[]): NdContentBlock[] {
        return blocks.filter(b => this.match(b))
    }

}

export class NdComponentDefinition {
    numBlocks: number | string;
    defaultTheme: any | undefined;
    defaultThemeYaml: string | undefined;

    constructor(numBlocks: number | string,
                defaultThemeYaml: string | undefined = undefined,
                defaultTheme: any | undefined = undefined) {

        this.numBlocks = numBlocks;
        this.defaultTheme = defaultTheme;
        this.defaultThemeYaml = defaultThemeYaml;
    }

}

export class NdSkinComponentProps<TComponentTheme = any, TComponentOptions = any> {
    rowIndex: number;
    componentIndex: number;
    content: NdContentBlock[];
    defaultThemeName: NdDefaultThemeName;
    theme: TComponentTheme | undefined;
    themes: TComponentTheme[];
    options: TComponentOptions | undefined;
    lng: string;
    imageProvider: ImageProvider;
    i18nextProvider: I18nextProvider;

    constructor(rowIndex: number,
                componentIndex: number,
                content: NdContentBlock[],
                defaultThemeName: NdDefaultThemeName,
                theme: TComponentTheme,
                themes: TComponentTheme[],
                options: TComponentOptions,
                lng: string,
                imageProvider: ImageProvider,
                i18nextProvider: I18nextProvider) {

        this.rowIndex = rowIndex;
        this.componentIndex = componentIndex;
        this.content = content;
        this.defaultThemeName = defaultThemeName;
        this.theme = theme;
        this.themes = themes.slice();
        this.options = options;
        this.lng = lng;
        this.imageProvider = imageProvider;
        this.i18nextProvider = i18nextProvider;
    }
}

