import { ThemeStyle } from "./theme-style";
export type RowStyle = ThemeStyle & {
    rowDisplay?: "flex" | "grid";
    componentHolder?: ThemeStyle;
};
export declare const defaultRowThemeImpl: RowStyle;
