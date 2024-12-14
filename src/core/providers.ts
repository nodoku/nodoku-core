import {JSX} from "react";
import {NdComponentDefinition, NdSkinComponentProps} from "../skin/nd-skin";
import {NdTranslatableText} from "../content/nd-content";
import {ImageStyle} from "../theme-utils/image-style";
import exp from "node:constants";

export type NdImageProps = {

    url: string;
    alt?: string;
    title?: string;
    imageStyle?: ImageStyle;

}

export type NdTrustedHtml = {__html: TrustedHTML}

export type AsyncFunctionComponent = (props: NdSkinComponentProps) => Promise<JSX.Element>

export type ComponentResolver = (componentName: string) => Promise<{compo: AsyncFunctionComponent, compoDef: NdComponentDefinition}>;

export type NdI18nextProvider = (lng: string) => Promise<{t: (text: NdTranslatableText) => string}>;

export type NdI18nextTrustedHtmlProvider = (lng: string) => Promise<{t: (text: NdTranslatableText) => NdTrustedHtml}>;

export type NdImageProvider = (imageProps: NdImageProps) => Promise<JSX.Element>;

export type NdI18NextPostProcessor = (text: string) => string;

export type NdHtmlSanitizer = (text: string) => NdTrustedHtml;