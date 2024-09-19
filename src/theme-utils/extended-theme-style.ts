import {CSSProperties} from "react";
import {ThemeStyle} from "./theme-style";

export class ExtendedThemeStyle extends ThemeStyle {
    css?: {
        light: CSSProperties,
        dark: CSSProperties
    };

}
