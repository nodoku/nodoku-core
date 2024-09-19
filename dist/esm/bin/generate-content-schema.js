#!/usr/bin/env node
import { register } from 'node:module';
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
const template = (await import("./mustache/content-schema.json.hbs")).default;
const linkRegexPattern = "^((http|https)?:\\\\/\\\\/)?\\\\/?([-a-zA-Z0-9._\\\\+~#=]{1,256})([-a-zA-Z0-9@:%._\\\\+~#=]{1,256})([-a-zA-Z0-9()@:%_\\\\+.~#?&\\\\/\\\\/=]*)$";
export function generateContentSchema() {
    const args = process.argv.slice(2);
    const dir = path.resolve();
    const schemaSrc = args[0] ? args[0] : "./schemas";
    console.log("generating content schema");
    const view = { linkRegexPattern };
    const output = Mustache.render(template, view);
    const fileName = `${dir}/${schemaSrc}/content-schema.json`;
    fs.writeFile(fileName, output, err => {
        if (err) {
            return console.error(err);
        }
        console.log(`${fileName}: File created!`);
    });
}
generateContentSchema();
