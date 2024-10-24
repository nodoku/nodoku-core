import { JSX } from "react";
import { NdComponentDefinition, NdSkinComponentProps } from "../skin/nd-skin";
import { NdTranslatedText } from "../content/nd-content";
export type AsyncFunctionComponent = (props: NdSkinComponentProps) => Promise<JSX.Element>;
export type ComponentResolver = (componentName: string) => Promise<{
    compo: AsyncFunctionComponent;
    compoDef: NdComponentDefinition;
}>;
export type I18nextProvider = (lng: string) => Promise<{
    t: (text: NdTranslatedText) => string;
}>;
export type ImageUrlProvider = (imageUrl: string) => Promise<string>;
