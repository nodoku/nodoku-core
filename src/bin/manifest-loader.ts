import {ComponentDef, Manifest} from "./manifest.js";
import fs from "node:fs";
import path from "path";

export function loadManifestsFromFolder(dir: string): Map<string, Manifest> {

    const comps: Map<string, Manifest> = new Map();

    const files: string[] = fs.readdirSync(dir);

    console.log("reading ...", dir)

    for (const f of files) {

        const stat: fs.Stats = fs.statSync(`${dir}/${f}`);
        if (stat.isDirectory()) {

            const m: Manifest | undefined = loadComponentsByManifest(`${dir}/${f}`, f);
            if (m) {
                comps.set(f, m);
            }

        }

    }

    return comps;

}

function loadComponentsByManifest(dir: string, moduleName: string): Manifest | undefined {

    const files: string[] = fs.readdirSync(dir);

    for (const f of files) {
        const moduleDir: string = path.resolve(dir, f);
        const stat: fs.Stats = fs.statSync(moduleDir);

        if (stat.isFile()) {

            if (f == "nodoku.manifest.json") {

                const manifest: Manifest = {
                    moduleName: moduleName,
                    moduleDir: moduleDir,
                    components: new Map<string, ComponentDef>()
                };

                console.log("found manifest ", `${dir}/${f}`, "reading...");

                let json: any;
                if (stat.isSymbolicLink()) {
                    json = JSON.parse(fs.readlinkSync(`${dir}/nodoku.manifest.json`).toString());
                } else {
                    json = JSON.parse(fs.readFileSync(`${dir}/nodoku.manifest.json`).toString());
                }
                console.log("loaded manifest ", path.resolve(dir, f));

                console.log("found manifest json ", json);

                manifest.namespace = json.namespace;

                Object.keys(json.components).forEach((k: string) => {

                    const v: any = json.components[k];

                    console.log("adding ", k, v);

                    // comps.set(k, Manifest.from(k, moduleName, v));
                    // manifest.components.set(k, new ComponentDef(v.implementation, v.schemaFile, v.optionsFile, v.defaultThemeFile, v.numBlocks))
                    manifest.components.set(k, {
                        implementation: v.implementation,
                        themeSchema: v.schemaFile,
                        optionsSchema: v.optionsFile,
                        defaultThemeFile: v.defaultThemeFile,
                        numBlocks: v.numBlocks,
                        clientSideComps: v.clientSideComps
                    })
                })

                return manifest;

            }
        }
    }

    return undefined;
}
