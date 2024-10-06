import { NdContentBlock } from "nodoku-core";
export declare function contentMarkdownProvider(mdFileUrl: string, contentLng: string, ns?: string | undefined): Promise<NdContentBlock[]>;
export declare function parseMarkdownAsContent(fileContents: string, contentLng: string, ns: string): NdContentBlock[];
