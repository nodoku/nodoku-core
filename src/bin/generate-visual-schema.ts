#!/usr/bin/env node


import { register } from 'node:module';

import {ComponentDef, Manifest} from "../content/manifest.js";
import fs from "node:fs";
import path from "path";
import Mustache from "mustache"

register('./import-load-hooks.js', import.meta.url);


/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/visual-common.json.mtl")).default;

function loadComponents(dir: string): Map<string, Manifest> {

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
        const stat: fs.Stats = fs.statSync(`${dir}/${f}`);

        if (stat.isFile()) {

            if (f == "nodoku.manifest.json") {

                const manifest: Manifest = new Manifest(moduleName);
                console.log("found manifest ", `${dir}/${f}`, "reading...");

                let json: any;
                if (stat.isSymbolicLink()) {
                    json = JSON.parse(fs.readlinkSync(`${dir}/nodoku.manifest.json`));
                } else {
                    json = JSON.parse(fs.readFileSync(`${dir}/nodoku.manifest.json`).toString());
                }
                console.log("loaded manifest ", `${dir}/${f}`);

                console.log("found manifest json ", json);

                Object.keys(json).forEach((k: string) => {

                    const v: any = json[`${k}`];

                    console.log("adding ", k, v);

                    // comps.set(k, Manifest.from(k, moduleName, v));
                    manifest.components.set(k, new ComponentDef(v.implementation, v.schema))
                })

                return manifest;

            }
        }
    }

    return undefined;
}


class TemplateView {
    components: Map<string, string> = new Map<string, string>();
}

interface LooseObject {
    [key: string]: any
}

function calculateTemplateView(dir: string | undefined = undefined, dirNodeModules: string | undefined = undefined): LooseObject {

    if (!dir) {
        dir = path.resolve();
    }

    if (!dirNodeModules) {
        dirNodeModules = "../node_modules"
    }

    const components: Map<string, Manifest> = loadComponents(`${dir}/node_modules`);

    console.log("componentns", components)

    const tv: TemplateView = new TemplateView();
    components.forEach((m: Manifest, k: string): void  => {

        console.log("treating " ,k)

        m.components.forEach((cd: ComponentDef, cn: string) => {

            console.log("this si def", cd, cn)

            tv.components.set(cn, `${dirNodeModules}/${m.moduleName}/${cd.componentSchema}`);

        })

    });


    const compSchemas: {name: string, schema: string}[] = []
    tv.components.forEach((v, k) => {
        compSchemas.push({name: k, schema: v})
    })

    return {components: compSchemas};
}

export function generateVisualSchema() {

    const args = process.argv.slice(2)

    const dir = path.resolve();
    const src = args[0] ? args[0] : "./schemas"

    console.log("generating visual schema");

    const view = calculateTemplateView();

    console.log("view", JSON.stringify(view));

    const output = Mustache.render(template, view);

    const fileName = `${dir}/${src}/visual-schema.json`;
    fs.writeFile(fileName, output, err => {
        if (err) {
            return console.error(err);
        }
        console.log(`${fileName}: File created!`);
    });

}

generateVisualSchema();