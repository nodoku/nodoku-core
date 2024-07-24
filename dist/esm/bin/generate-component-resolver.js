#!/usr/bin/env node
import { register } from 'node:module';
import { ComponentDef, Manifest } from "../content/manifest.js";
import fs from "node:fs";
import path from "path";
import Mustache from "mustache";
register('./import-load-hooks.js', import.meta.url);
/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/default-component-resolver.ts.mtl")).default;
function loadComponents(dir) {
    const comps = new Map();
    const files = fs.readdirSync(dir);
    console.log("reading ...", dir);
    for (const f of files) {
        const stat = fs.statSync(`${dir}/${f}`);
        if (stat.isDirectory()) {
            const m = loadComponentsByManifest(`${dir}/${f}`, f);
            if (m) {
                comps.set(f, m);
            }
        }
    }
    return comps;
}
function loadComponentsByManifest(dir, moduleName) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const stat = fs.statSync(`${dir}/${f}`);
        if (stat.isFile()) {
            if (f == "nodoku.manifest.json") {
                const manifest = new Manifest(moduleName);
                console.log("found manifest ", `${dir}/${f}`, "reading...");
                let json;
                if (stat.isSymbolicLink()) {
                    json = JSON.parse(fs.readlinkSync(`${dir}/nodoku.manifest.json`));
                }
                else {
                    json = JSON.parse(fs.readFileSync(`${dir}/nodoku.manifest.json`).toString());
                }
                console.log("loaded manifest ", path.resolve(dir, f));
                console.log("found manifest json ", json);
                manifest.namespace = json.namespace;
                Object.keys(json.components).forEach((k) => {
                    const v = json.components[k];
                    console.log("adding ", k, v);
                    // comps.set(k, Manifest.from(k, moduleName, v));
                    manifest.components.set(k, new ComponentDef(v.implementation, v.schema));
                });
                return manifest;
            }
        }
    }
    return undefined;
}
class TemplateView {
    modules = new Map();
    names = new Map();
}
function calculateTemplateView(dir = undefined) {
    if (!dir) {
        dir = path.resolve();
    }
    const components = loadComponents(`${dir}/node_modules`);
    const tv = new TemplateView();
    components.forEach((m, k) => {
        if (!tv.modules.get(m.moduleName)) {
            console.log("adding ", m.moduleName);
            tv.modules.set(m.moduleName, []);
        }
        if (m.namespace) {
            tv.modules.get(m.moduleName).push(m.namespace);
            m.components.forEach((cd, cn) => {
                tv.names.set(cn, `${m.namespace}.${cd.implementation}`);
            });
        }
        else {
            m.components.forEach((cd, cn) => {
                tv.modules.get(m.moduleName).push(cd.implementation);
                tv.names.set(cn, cd.implementation);
            });
        }
    });
    return tv;
}
export function generateComponentResolver() {
    const args = process.argv.slice(2);
    const dir = path.resolve();
    const src = args[0] ? args[0] : "./src";
    console.log("generating component resolver");
    const tv = calculateTemplateView();
    const view = {
        modules: Array.from(tv.modules.entries()).map((e) => {
            return { "module": e[0], "comps": e[1].join(", ") };
        }),
        names: Array.from(tv.names.entries()).map((n) => { return { n: n[0], c: n[1] }; })
    };
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
