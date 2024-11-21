import {ThemeStyle} from "./theme-style";

export type RowStyle = ThemeStyle & {
    rowDisplay?: "flex" | "grid";
    componentHolder?: ThemeStyle;
}
