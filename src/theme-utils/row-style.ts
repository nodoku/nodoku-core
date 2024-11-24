import {ThemeStyle} from "./theme-style";

export type RowStyle = ThemeStyle & {
    rowDisplay?: "flex" | "grid";
    componentHolder?: ThemeStyle;
}

export const defaultRowThemeImpl: RowStyle = {
    base: "md:grid-cols-1",
    decoration: "gap-4",
    rowDisplay: "grid",
    componentHolder: {
        base: "min-w-0 overflow-hidden",
        decoration: ""
    },
}
