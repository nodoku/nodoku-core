import { JSX } from "react";
import { NdComponentDefinition, NdSkinComponentProps } from "../skin/nd-skin";
export type AsyncFunctionComponent = (props: NdSkinComponentProps) => Promise<JSX.Element>;
export type i18nextProvider = (lng: string) => Promise<{
    t: (key: string, ns: string) => string;
}>;
export type ComponentProvider = (componentName: string) => Promise<{
    compo: AsyncFunctionComponent;
    compoDef: NdComponentDefinition;
}>;
