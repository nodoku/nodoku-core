import { LbComponentProps } from "./lb-content-block";
import { JSX } from "react";
export type AsyncFunctionComponent = (props: LbComponentProps) => Promise<JSX.Element>;
export type ContentYamlProvider = (lng: string, ns: string) => Promise<string>;
export type VisualYamlProvider = (pageName: string) => Promise<string>;
export type i18nextProvider = (lng: string) => Promise<{
    t: (key: string, ns: string) => string;
}>;
export type ComponentProvider = (componentName: string) => Promise<AsyncFunctionComponent>;
