import { NdPageSkin } from "../../skin/nd-skin";
export declare function skinYamlProvider(yamlFileUrl: string): Promise<NdPageSkin>;
export declare function parseYamlContentAsSkin(fileContents: string): NdPageSkin;
