import { JSX } from "react";
import { NdComponentDefinition, NdSkinComponentProps } from "../skin/nd-skin";
import { NdTranslatableText } from "../content/nd-content";
import { ImageStyle } from "../theme-utils/image-style";
export type NdImageProps = {
    url: string;
    alt?: string;
    title?: string;
    imageStyle?: ImageStyle;
};
export type AsyncFunctionComponent = (props: NdSkinComponentProps) => Promise<JSX.Element>;
export type ComponentResolver = (componentName: string) => Promise<{
    compo: AsyncFunctionComponent;
    compoDef: NdComponentDefinition;
}>;
export type I18nextProvider = (lng: string) => Promise<{
    t: (text: NdTranslatableText) => string;
}>;
export type ImageProvider = (imageProps: NdImageProps) => Promise<JSX.Element>;
