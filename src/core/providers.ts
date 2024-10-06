import {JSX} from "react";
import {NdComponentDefinition, NdSkinComponentProps} from "../skin/nd-skin";

export type AsyncFunctionComponent = (props: NdSkinComponentProps) => Promise<JSX.Element>

export type ComponentProvider = (componentName: string) => Promise<{compo: AsyncFunctionComponent, compoDef: NdComponentDefinition}>;

export type I18nextProvider = (lng: string) => Promise<{t: (key: string, ns: string) => string}>;

export type ImageUrlProvider = (imageUrl: string) => Promise<string>;
