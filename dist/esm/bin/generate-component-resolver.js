#!/usr/bin/env node
import { register } from 'node:module';
import fs from "node:fs";
import path from "path";
import Mustache from "mustache";
import { loadManifestsFromFolder } from "./manifest-loader.js";
register('./import-load-hooks.js', import.meta.url);
/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/component-resolver.ts.hbs")).default;
function calculateTemplateView(dirNodeModules = undefined) {
    if (!dirNodeModules) {
        dirNodeModules = `${path.resolve()}/node_modules`;
    }
    const manifests = loadManifestsFromFolder(dirNodeModules);
    const view = { modules: [], comps: [] };
    manifests.forEach((m, k) => {
        let prefix = "";
        if (m.namespace) {
            view.modules.push({ module: m.moduleName, comps: [m.namespace] });
            prefix = `${m.namespace}.`;
        }
        else {
            view.modules.push({ module: m.moduleName, comps: Array.from(m.components.entries()).map(c => c[1].implementation) });
        }
        m.components.forEach((cd, cn) => {
            let nb;
            if (typeof cd.numBlocks == "string") {
                nb = `"${cd.numBlocks}"`;
            }
            else {
                nb = `${cd.numBlocks}`;
            }
            view.comps.push({ name: cn, impl: `${prefix}${cd.implementation}`, defaultThemeFile: "./" + path.relative(path.resolve("."), path.resolve("./schemas", m.moduleName, cd.defaultThemeFile)).replaceAll("\\", "/"), numBlocks: nb });
        });
    });
    return view;
}
export function generateComponentResolver() {
    const args = process.argv.slice(2);
    const dir = path.resolve();
    const src = args[0] ? args[0] : "./src";
    console.log("generating component resolver");
    const view = calculateTemplateView();
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
