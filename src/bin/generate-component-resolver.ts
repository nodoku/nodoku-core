#!/usr/bin/env node
import { register } from 'node:module';

import {Manifest} from "../content/manifest.js";
import fs from "node:fs";
import path from "path";
import Mustache from "mustache"

console.log("this is my log")

register('./import-load-hooks.js', import.meta.url);


/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/default-component-resolver.mtl")).default;

function loadComponents(dir: string): Map<string, Manifest> {

    const comps: Map<string, Manifest> = new Map();

    const files: string[] = fs.readdirSync(dir);

    console.log("reading ...", dir)

    for (const f of files) {

        const stat: fs.Stats = fs.statSync(`${dir}/${f}`);
        if (stat.isDirectory()) {

            loadComponentsByManifest(`${dir}/${f}`, f, comps);

        }

    }

    return comps;

}

function loadComponentsByManifest(dir: string, moduleName: string, comps: Map<string, Manifest>): void {

    const files: string[] = fs.readdirSync(dir);

    for (const f of files) {
        const stat: fs.Stats = fs.statSync(`${dir}/${f}`);

        if (stat.isFile()) {

            if (f == "nodoku.manifest.json") {

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

                    comps.set(k, Manifest.from(k, moduleName, v));
                })
            }
        }
    }
}


class TemplateView {
    modules: Map<string, string[]> = new Map<string, string[]>();
    names: Map<string, string> = new Map<string, string>();
}

function calculateTemplateView(dir: string | undefined = undefined): TemplateView {

    if (!dir) {
        dir = path.resolve();
    }

    const components: Map<string, Manifest> = loadComponents(`${dir}/node_modules`);

    const tv: TemplateView = new TemplateView();
    components.forEach((m: Manifest): void  => {

        if (!tv.modules.get(m.moduleName)) {
            console.log("adding ", m.moduleName)
            tv.modules.set(m.moduleName, []);
        }
        tv.modules.get(m.moduleName)!.push(m.componentImplementation);

        tv.names.set(m.componentName, m.componentImplementation)

    });

    return tv;
}

export function generateComponentResolver() {

    const args = process.argv.slice(2)

    const dir = path.resolve();
    const src = args[0] ? args[0] : "./src"

    console.log("generating component resolver");

    const tv: TemplateView = calculateTemplateView();
    const view = {
        modules: Array.from(tv.modules.entries()).map((e) => {
            return {"module": e[0], "comps": e[1].join(", ") };
        }),
        names: Array.from(tv.names.entries()).map((n) => {return {n: n[0], c: n[1]}})
    }

    console.log("view", JSON.stringify(view));

    const output = Mustache.render(template, view);

    const fileName = `${dir}/${src}/nodoku-component-resolver.ts`;
    fs.writeFile(fileName, output, err => {
        if (err) {
            return console.error(err);
        }
        console.log(`${fileName}: File created!`);
    });

}

generateComponentResolver();