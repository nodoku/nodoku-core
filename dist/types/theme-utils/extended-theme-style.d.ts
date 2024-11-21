import { CSSProperties } from "react";
import { ThemeStyle } from "./theme-style";
export type ExtendedThemeStyle = ThemeStyle & {
    css?: {
        light: CSSProperties;
        dark: CSSProperties;
    };
};
