#!/usr/bin/env node
import { register } from 'node:module';

import {ComponentDef, Manifest} from "./manifest.js";
import fs from "node:fs";
import path from "path";
import Mustache from "mustache"
import {loadManifestsFromFolder} from "./manifest-loader.js";

register('./import-load-hooks.js', import.meta.url);


/*
 * we need to use a dynamic import here since otherwise we have no guarantee that the template
 * file won't start loading prior to hooks registration
 * we register hooks, and only then use dynamic import to load custom template file
 */
// @ts-ignore
const template = (await import("./mustache/component-resolver.ts.hbs")).default;

type TemplateView = {
    modules: {module: string, comps: string[]}[];
    comps: {name: string, impl: string, defaultThemeFile: string, numBlocks: string | number}[];
    clSideComps: {n: string, isLast: boolean }[];
}

function calculateTemplateView(dirNodeModules: string | undefined = undefined): TemplateView {

    if (!dirNodeModules) {
        dirNodeModules = `${path.resolve()}/node_modules`
    }

    const manifests: Map<string, Manifest> = loadManifestsFromFolder(dirNodeModules);

    const view: TemplateView = {modules: [], comps: [], clSideComps: []};

    manifests.forEach((m: Manifest, k: string): void  => {

        let prefix = ""

        if (m.namespace) {
            view.modules.push({module: m.moduleName, comps: [m.namespace]})
            prefix = `${m.namespace}.`
        } else {
            view.modules.push({module: m.moduleName, comps: Array.from(m.components.entries()).map(c => c[1].implementation)})
        }

        m.components.forEach((cd: ComponentDef, cn: string) => {
            let nb: string
            if (typeof cd.numBlocks == "string") {
                nb = `"${cd.numBlocks}"`
            } else {
                nb = `${cd.numBlocks}`
            }
            view.comps.push({
                name: cn,
                impl: `${prefix}${cd.implementation}`,
                defaultThemeFile: "./" + path.relative(path.resolve("."), path.resolve("./schemas", m.moduleName, cd.defaultThemeFile)).replaceAll("\\", "/"),
                numBlocks: nb
            });
            if (cd.clientSideComps) {
                cd.clientSideComps.forEach(cl => {
                    view.clSideComps.push({n: `${cn}:${cl}`, isLast: false})
                })
            }
        })

    });


    if (view.clSideComps && view.clSideComps.length > 0) {
        view.clSideComps[view.clSideComps.length - 1].isLast = true;
    }

    return view;
}

export function generateComponentResolver() {

    const args = process.argv.slice(2)

    const dir = path.resolve();
    const src = args[0] ? args[0] : "./src"

    console.log("generating component resolver");

    const view: TemplateView = calculateTemplateView();

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